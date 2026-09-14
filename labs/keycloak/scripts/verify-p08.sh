#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
state_directory=$lab_directory/.state
verification_directory=$state_directory/verification/p08
compose_command=$lab_directory/samba/compose.sh
p03_result=$state_directory/verification/p03/before-recreate.txt

require_file() {
  if [ ! -s "$1" ]; then
    echo "required preserved state is missing or empty: $1" >&2
    exit 1
  fi
}

for preserved_file in \
  "$p03_result" \
  "$state_directory/verification/p04/cluster.txt" \
  "$state_directory/verification/p05/persistence.txt" \
  "$state_directory/verification/p06/oidc-flow.txt" \
  "$state_directory/verification/p07/sso-and-api.txt" \
  "$state_directory/directory-ca/ca.key" \
  "$state_directory/directory-ca/ca.crt" \
  "$state_directory/directory-ca/dc1.key" \
  "$state_directory/directory-ca/dc1.crt" \
  "$state_directory/web-ca/ca.key" \
  "$state_directory/web-ca/ca.crt" \
  "$state_directory/web-ca/keycloak.key" \
  "$state_directory/web-ca/keycloak.crt" \
  "$state_directory/web-ca/app-a.key" \
  "$state_directory/web-ca/app-a.crt" \
  "$state_directory/web-ca/app-b.key" \
  "$state_directory/web-ca/app-b.crt" \
  "$state_directory/secrets/keycloak-db-password" \
  "$state_directory/secrets/keycloak-bootstrap-admin-password" \
  "$state_directory/secrets/keycloak-local-user-password" \
  "$state_directory/secrets/app-a-client-secret" \
  "$state_directory/secrets/app-a-session-secret" \
  "$state_directory/secrets/app-b-client-secret" \
  "$state_directory/secrets/app-b-session-secret" \
  "$state_directory/secrets/samba-admin-password" \
  "$state_directory/secrets/samba-alice-password" \
  "$state_directory/secrets/samba-bob-password"
do
  require_file "$preserved_file"
done

for container_name in \
  keycloak-lab-samba \
  keycloak-lab-postgres \
  keycloak-lab-keycloak \
  keycloak-lab-app-a \
  keycloak-lab-app-b \
  keycloak-lab-api
do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
  if [ "$status" != running/healthy ]; then
    echo "preserved P07 service is not healthy: $container_name ($status)" >&2
    exit 1
  fi
done

network_subnet=$(docker network inspect keycloak-lab --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}' 2>/dev/null || true)
network_project=$(docker network inspect keycloak-lab --format '{{if .Labels}}{{index .Labels "com.docker.compose.project"}}{{end}}' 2>/dev/null || true)
if [ "$network_subnet" != 172.30.0.0/24 ] || [ "$network_project" != keycloak-lab ]; then
  echo 'keycloak-lab must remain the Compose-owned 172.30.0.0/24 bridge' >&2
  exit 1
fi

runtime_cpus=$(docker info --format '{{.NCPU}}')
runtime_memory_bytes=$(docker info --format '{{.MemTotal}}')
if [ "$runtime_cpus" -lt 4 ] || [ "$runtime_memory_bytes" -lt 8053063680 ]; then
  echo "P08 requires a 4 CPU/8 GiB runtime; Docker exposed $runtime_cpus CPUs and $runtime_memory_bytes bytes" >&2
  exit 1
fi

case $(uname -s) in
  Darwin)
    available_memory_kib=$(colima ssh -- awk '/MemAvailable:/ {print $2}' /proc/meminfo)
    available_disk_kib=$(colima ssh -- df -Pk /var/lib/docker | awk 'NR == 2 {print $4}')
    ;;
  Linux)
    available_memory_kib=$(awk '/MemAvailable:/ {print $2}' /proc/meminfo)
    docker_root=$(docker info --format '{{.DockerRootDir}}')
    available_disk_kib=$(df -Pk "$docker_root" | awk 'NR == 2 {print $4}')
    ;;
  *)
    echo "unsupported P08 host: $(uname -s)" >&2
    exit 1
    ;;
esac
if [ "$available_memory_kib" -lt 5242880 ]; then
  echo "P08 requires 5 GiB MemAvailable; found $available_memory_kib KiB" >&2
  exit 1
fi
if [ "$available_disk_kib" -lt 20971520 ]; then
  echo "P08 requires 20 GiB free Docker data disk; found $available_disk_kib KiB" >&2
  exit 1
fi

temporary_directory=$(mktemp -d "${TMPDIR:-/tmp}/keycloak-p08-verify.XXXXXX")
trap 'rm -rf "$temporary_directory"' EXIT HUP INT TERM

preserved_fingerprint() {
  for preserved_root in \
    "$state_directory/directory-ca" \
    "$state_directory/web-ca" \
    "$state_directory/secrets" \
    "$state_directory/verification/p03" \
    "$state_directory/verification/p04" \
    "$state_directory/verification/p05" \
    "$state_directory/verification/p06" \
    "$state_directory/verification/p07"
  do
    find "$preserved_root" -type f
  done | sort | while IFS= read -r preserved_path; do
    shasum -a 256 "$preserved_path"
  done
}

other_workload_state() {
  docker ps --filter name=supabase_ --format '{{.Names}}' | sort | while IFS= read -r name; do
    [ -n "$name" ] || continue
    docker inspect "$name" --format '{{.Name}}|{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}|{{range .Mounts}}{{.Type}}:{{.Name}}:{{.Source}}:{{.Destination}};{{end}}'
  done
}

preserved_fingerprint >"$temporary_directory/preserved-before.txt"
other_workload_state >"$temporary_directory/other-workload-before.txt"

mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"

cd "$lab_directory"
"$compose_command" --profile p08 config >"$verification_directory/compose-config.yaml"
"$compose_command" --profile p08 build p08-seed
"$compose_command" --profile p08 run --rm p08-seed >"$verification_directory/seed.txt"
second_seed_output=$verification_directory/.seed-second.txt.tmp
"$compose_command" --profile p08 run --rm p08-seed >"$second_seed_output"
cmp "$verification_directory/seed.txt" "$second_seed_output"
rm -f "$second_seed_output"

"$compose_command" --profile p08 run --rm --no-deps p08-diagnostic \
  >"$verification_directory/federated-login-token-api.txt"

docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/samba-after-p08.txt"
cmp "$p03_result" "$verification_directory/samba-after-p08.txt"

postgres_volume=$(docker inspect keycloak-lab-postgres \
  --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql"}}{{.Name}}{{end}}{{end}}')
if [ "$postgres_volume" != keycloak-lab-postgres-data ]; then
  echo "unexpected PostgreSQL volume at /var/lib/postgresql: $postgres_volume" >&2
  exit 1
fi
samba_volume=$(docker inspect keycloak-lab-samba \
  --format '{{range .Mounts}}{{if eq .Destination "/var/lib/samba"}}{{.Name}}{{end}}{{end}}')
if [ "$samba_volume" != keycloak-lab-samba-data ]; then
  echo "unexpected Samba volume at /var/lib/samba: $samba_volume" >&2
  exit 1
fi

if docker inspect keycloak-lab-keycloak --format '{{range .Mounts}}{{println .Destination}}{{end}}' \
  | grep -q '^/run/secrets/samba_admin_password$'; then
  echo 'Keycloak runtime unexpectedly mounts the Samba bind credential' >&2
  exit 1
fi

preserved_fingerprint >"$temporary_directory/preserved-after.txt"
cmp "$temporary_directory/preserved-before.txt" "$temporary_directory/preserved-after.txt"
other_workload_state >"$temporary_directory/other-workload-after.txt"
cmp "$temporary_directory/other-workload-before.txt" "$temporary_directory/other-workload-after.txt"

printf 'runtime_cpus=%s\nruntime_memory_bytes=%s\nmem_available_kib=%s\ndocker_disk_available_kib=%s\n' \
  "$runtime_cpus" "$runtime_memory_bytes" "$available_memory_kib" "$available_disk_kib" \
  >"$verification_directory/resources.txt"
printf 'samba_volume=%s\npostgres_volume=%s\ndomain_and_p03_state=unchanged\np04_p05_p06_p07_records=unchanged\nexisting_ca_and_secrets=unchanged\nother_workloads=unchanged\n' \
  "$samba_volume" "$postgres_volume" >"$verification_directory/preservation.txt"
printf 'provider=READ_ONLY\nconnection=ldaps_only\nstarttls=false\nkerberos=false\nbind_credential_runtime_mount=absent\nseed=idempotent\n' \
  >"$verification_directory/federation-security.txt"

printf 'P08 non-browser Compose verification passed. Evidence is in %s\n' \
  "$verification_directory"
