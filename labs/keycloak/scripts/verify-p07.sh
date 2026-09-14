#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
state_directory=$lab_directory/.state
verification_directory=$state_directory/verification/p07
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
  "$state_directory/secrets/keycloak-db-password" \
  "$state_directory/secrets/keycloak-bootstrap-admin-password" \
  "$state_directory/secrets/keycloak-local-user-password" \
  "$state_directory/secrets/app-a-client-secret" \
  "$state_directory/secrets/app-a-session-secret"
do
  require_file "$preserved_file"
done

for container_name in \
  keycloak-lab-samba \
  keycloak-lab-postgres \
  keycloak-lab-keycloak \
  keycloak-lab-app-a
do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
  if [ "$status" != running/healthy ]; then
    echo "preserved P06 service is not healthy: $container_name ($status)" >&2
    exit 1
  fi
done

network_subnet=$(docker network inspect keycloak-lab --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}' 2>/dev/null || true)
network_project=$(docker network inspect keycloak-lab --format '{{if .Labels}}{{index .Labels "com.docker.compose.project"}}{{end}}' 2>/dev/null || true)
if [ "$network_subnet" != 172.30.0.0/24 ] || [ "$network_project" != keycloak-lab ]; then
  echo 'keycloak-lab must remain the Compose-owned 172.30.0.0/24 bridge' >&2
  exit 1
fi

port_owner=$(docker ps --filter publish=30082 --format '{{.Names}}' | head -n 1)
if [ -n "$port_owner" ] && [ "$port_owner" != keycloak-lab-app-b ]; then
  echo "host port 30082 is already published by $port_owner" >&2
  exit 1
fi

runtime_cpus=$(docker info --format '{{.NCPU}}')
runtime_memory_bytes=$(docker info --format '{{.MemTotal}}')
if [ "$runtime_cpus" -lt 4 ] || [ "$runtime_memory_bytes" -lt 8053063680 ]; then
  echo "P07 requires a 4 CPU/8 GiB runtime; Docker exposed $runtime_cpus CPUs and $runtime_memory_bytes bytes" >&2
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
    echo "unsupported P07 host: $(uname -s)" >&2
    exit 1
    ;;
esac
if [ "$available_memory_kib" -lt 5242880 ]; then
  echo "P07 requires 5 GiB MemAvailable; found $available_memory_kib KiB" >&2
  exit 1
fi
if [ "$available_disk_kib" -lt 20971520 ]; then
  echo "P07 requires 20 GiB free Docker data disk; found $available_disk_kib KiB" >&2
  exit 1
fi

temporary_directory=$(mktemp -d "${TMPDIR:-/tmp}/keycloak-p07-verify.XXXXXX")
trap 'rm -rf "$temporary_directory"' EXIT HUP INT TERM

preserved_fingerprint() {
  openssl dgst -sha256 \
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
    "$state_directory/secrets/keycloak-db-password" \
    "$state_directory/secrets/keycloak-bootstrap-admin-password" \
    "$state_directory/secrets/keycloak-local-user-password" \
    "$state_directory/secrets/app-a-client-secret" \
    "$state_directory/secrets/app-a-session-secret" \
    "$state_directory/verification/p03/before-recreate.txt" \
    "$state_directory/verification/p04/cluster.txt" \
    "$state_directory/verification/p05/persistence.txt" \
    "$state_directory/verification/p06/oidc-flow.txt"
}

other_workload_state() {
  docker ps --filter name=supabase_ --format '{{.Names}}' | sort | while IFS= read -r name; do
    [ -n "$name" ] || continue
    docker inspect "$name" --format '{{.Name}}|{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}|{{range .Mounts}}{{.Type}}:{{.Name}}:{{.Source}}:{{.Destination}};{{end}}'
  done
}

preserved_fingerprint >"$temporary_directory/preserved-before.txt"
other_workload_state >"$temporary_directory/other-workload-before.txt"

"$script_directory/prepare-p07-state.sh"
mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"

cd "$lab_directory"
"$compose_command" --profile p07 config >"$verification_directory/compose-config.yaml"
"$compose_command" --profile p07 build p07-seed
"$compose_command" --profile p07 run --rm p07-seed \
  >"$verification_directory/seed.txt"
second_seed_output=$verification_directory/.seed-second.txt.tmp
"$compose_command" --profile p07 run --rm p07-seed >"$second_seed_output"
cmp "$verification_directory/seed.txt" "$second_seed_output"
rm -f "$second_seed_output"

"$compose_command" up --detach --wait --build api app-a app-b

host_app_url=https://app-b.keycloak.test:30082/healthz
host_app_health=$(curl --fail --silent --show-error \
  --noproxy '*' \
  --cacert "$state_directory/web-ca/ca.crt" \
  --resolve app-b.keycloak.test:30082:127.0.0.1 \
  "$host_app_url")
if [ "$host_app_health" != ok ]; then
  echo "app B returned an unexpected host health response: $host_app_health" >&2
  exit 1
fi
if curl --fail --silent --show-error \
  --noproxy '*' \
  --cacert "$state_directory/directory-ca/ca.crt" \
  --resolve app-b.keycloak.test:30082:127.0.0.1 \
  "$host_app_url" >/dev/null 2>&1; then
  echo 'app B HTTPS verification unexpectedly succeeded with the directory CA' >&2
  exit 1
fi
printf 'url=%s\nweb_ca=verified\nwrong_directory_ca=tls_verification_failed\n' \
  "$host_app_url" >"$verification_directory/host-https.txt"

for container_name in keycloak-lab-app-a keycloak-lab-app-b keycloak-lab-api; do
  uid=$(docker exec "$container_name" id -u)
  if [ "$uid" != 1000 ]; then
    echo "$container_name is not running as Node image UID 1000: $uid" >&2
    exit 1
  fi
  read_only=$(docker inspect "$container_name" --format '{{.HostConfig.ReadonlyRootfs}}')
  cap_drop=$(docker inspect "$container_name" --format '{{json .HostConfig.CapDrop}}')
  security_opt=$(docker inspect "$container_name" --format '{{json .HostConfig.SecurityOpt}}')
  if [ "$read_only" != true ] || [ "$cap_drop" != '["ALL"]' ] || \
     [ "$security_opt" != '["no-new-privileges:true"]' ]; then
    echo "$container_name does not have the required container hardening" >&2
    exit 1
  fi
done

docker exec keycloak-lab-app-b sh -ec '
  for secret_file in \
    /run/secrets/app_b_client_secret \
    /run/secrets/app_b_session_secret \
    /run/secrets/app_b_https_key
  do
    [ -s "$secret_file" ]
    [ -r "$secret_file" ]
  done
  [ ! -e /run/secrets/keycloak_bootstrap_admin_password ]
'

for secret_target in \
  /run/secrets/app_b_client_secret \
  /run/secrets/app_b_session_secret \
  /run/secrets/app_b_https_key
do
  secret_writable=$(docker inspect keycloak-lab-app-b \
    --format "{{range .Mounts}}{{if eq .Destination \"$secret_target\"}}{{.RW}}{{end}}{{end}}")
  if [ "$secret_writable" != false ]; then
    echo "app B secret mount is not read-only: $secret_target" >&2
    exit 1
  fi
done

if docker inspect keycloak-lab-api --format '{{range .Mounts}}{{println .Destination}}{{end}}' \
  | grep -q '^/run/secrets/'; then
  echo 'API unexpectedly has a secret mount' >&2
  exit 1
fi
api_port_bindings=$(docker inspect keycloak-lab-api --format '{{json .HostConfig.PortBindings}}')
if [ "$api_port_bindings" != '{}' ] && [ "$api_port_bindings" != null ]; then
  echo "API unexpectedly publishes a host port: $api_port_bindings" >&2
  exit 1
fi

app_b_environment=$verification_directory/.app-b-environment.txt.tmp
docker inspect keycloak-lab-app-b --format '{{range .Config.Env}}{{println .}}{{end}}' \
  >"$app_b_environment"
for secret_file in \
  "$state_directory/secrets/app-b-client-secret" \
  "$state_directory/secrets/app-b-session-secret"
do
  if grep -Fq -f "$secret_file" "$app_b_environment"; then
    echo "secret value from $secret_file leaked into app B environment" >&2
    rm -f "$app_b_environment"
    exit 1
  fi
done
rm -f "$app_b_environment"

"$compose_command" --profile p07 run --rm --no-deps p07-diagnostic \
  >"$verification_directory/sso-and-api.txt"

docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/samba-after-p07.txt"
cmp "$p03_result" "$verification_directory/samba-after-p07.txt"

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

preserved_fingerprint >"$temporary_directory/preserved-after.txt"
cmp "$temporary_directory/preserved-before.txt" "$temporary_directory/preserved-after.txt"
other_workload_state >"$temporary_directory/other-workload-after.txt"
cmp "$temporary_directory/other-workload-before.txt" "$temporary_directory/other-workload-after.txt"

{
  printf 'app_a_uid=1000\napp_b_uid=1000\napi_uid=1000\n'
  printf 'app_b_secrets=readable_read_only\napi_secrets=none\n'
  printf 'root_filesystems=read_only\ncapabilities=all_dropped\nno_new_privileges=true\n'
  printf 'inspect_environment_secret_values=absent\n'
} >"$verification_directory/security.txt"
printf 'api_host_ports=none\napi_network=keycloak-lab\napi_audience=lab-api\n' \
  >"$verification_directory/api-container.txt"
printf 'runtime_cpus=%s\nruntime_memory_bytes=%s\nmem_available_kib=%s\ndocker_disk_available_kib=%s\n' \
  "$runtime_cpus" "$runtime_memory_bytes" "$available_memory_kib" "$available_disk_kib" \
  >"$verification_directory/resources.txt"
printf 'samba_volume=%s\npostgres_volume=%s\np03_state=unchanged\np04_p05_p06_records=unchanged\nexisting_ca_and_secrets=unchanged\nother_workloads=unchanged\n' \
  "$samba_volume" "$postgres_volume" \
  >"$verification_directory/preservation.txt"

printf 'P07 non-browser Compose verification passed. Evidence is in %s\n' \
  "$verification_directory"
