#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
state_directory=$lab_directory/.state
verification_directory=$state_directory/verification/p05
compose_command=$lab_directory/samba/compose.sh
kind_binary=$state_directory/tools/kind-0.33.0
p03_result=$state_directory/verification/p03/before-recreate.txt
issuer=https://keycloak.keycloak.test:30080/realms/study

require_file() {
  if [ ! -s "$1" ]; then
    echo "required preserved state is missing or empty: $1" >&2
    exit 1
  fi
}

for preserved_file in \
  "$p03_result" \
  "$state_directory/verification/p04/cluster.txt" \
  "$state_directory/verification/p04/persistence.txt" \
  "$state_directory/directory-ca/ca.crt" \
  "$state_directory/directory-ca/dc1.crt" \
  "$state_directory/directory-ca/dc1.key" \
  "$state_directory/secrets/samba-admin-password" \
  "$state_directory/secrets/samba-alice-password" \
  "$state_directory/secrets/samba-bob-password"
do
  require_file "$preserved_file"
done

if [ -x "$kind_binary" ] && "$kind_binary" get clusters 2>/dev/null | grep -Fxq keycloak-lab; then
  echo 'the exact P04 keycloak-lab cluster still exists; inspect and remove only that cluster after user approval' >&2
  exit 1
fi
if docker container inspect keycloak-lab-control-plane >/dev/null 2>&1; then
  echo 'keycloak-lab-control-plane still exists; refusing to take its address or ports' >&2
  exit 1
fi

network_subnet=$(docker network inspect keycloak-lab --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}' 2>/dev/null || true)
network_project=$(docker network inspect keycloak-lab --format '{{if .Labels}}{{index .Labels "com.docker.compose.project"}}{{end}}' 2>/dev/null || true)
if [ "$network_subnet" != 172.30.0.0/24 ] || [ "$network_project" != keycloak-lab ]; then
  echo 'keycloak-lab must remain the P03 Compose-owned 172.30.0.0/24 bridge' >&2
  exit 1
fi

for host_port in 30080 30081 30082; do
  port_owner=$(docker ps --filter "publish=$host_port" --format '{{.Names}}' | head -n 1)
  if [ -n "$port_owner" ] && [ "$port_owner" != keycloak-lab-keycloak ]; then
    echo "host port $host_port is already published by $port_owner" >&2
    exit 1
  fi
done

runtime_cpus=$(docker info --format '{{.NCPU}}')
runtime_memory_bytes=$(docker info --format '{{.MemTotal}}')
minimum_runtime_memory_bytes=8053063680
if [ "$runtime_cpus" -lt 4 ] || [ "$runtime_memory_bytes" -lt "$minimum_runtime_memory_bytes" ]; then
  echo "P05 requires a 4 CPU/8 GiB runtime; Docker exposed $runtime_cpus CPUs and $runtime_memory_bytes bytes" >&2
  exit 1
fi

case $(uname -s) in
  Darwin)
    colima_resources=$(colima list | awk '$1 == "default" {print $4 "|" $5}')
    if [ "$colima_resources" != '4|8GiB' ]; then
      echo "P05 requires the default Colima profile at 4 CPU/8 GiB; found $colima_resources" >&2
      exit 1
    fi
    available_memory_kib=$(colima ssh -- awk '/MemAvailable:/ {print $2}' /proc/meminfo)
    available_disk_kib=$(colima ssh -- df -Pk /var/lib/docker | awk 'NR == 2 {print $4}')
    ;;
  Linux)
    available_memory_kib=$(awk '/MemAvailable:/ {print $2}' /proc/meminfo)
    docker_root=$(docker info --format '{{.DockerRootDir}}')
    available_disk_kib=$(df -Pk "$docker_root" | awk 'NR == 2 {print $4}')
    ;;
  *)
    echo "unsupported P05 host: $(uname -s)" >&2
    exit 1
    ;;
esac
if [ "$available_memory_kib" -lt 5242880 ]; then
  echo "P05 requires 5 GiB MemAvailable; found $available_memory_kib KiB" >&2
  exit 1
fi
if [ "$available_disk_kib" -lt 20971520 ]; then
  echo "P05 requires 20 GiB free Docker data disk; found $available_disk_kib KiB" >&2
  exit 1
fi

mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"

"$script_directory/prepare-p05-state.sh"
cd "$lab_directory"
"$compose_command" --profile diagnostic config >"$verification_directory/compose-config.yaml"
"$compose_command" up --detach --wait --build samba postgres keycloak

if [ "$(docker inspect keycloak-lab-keycloak --format '{{.Config.User}}')" != 1000 ]; then
  echo 'Keycloak is not running as the official image service UID 1000' >&2
  exit 1
fi
docker exec keycloak-lab-keycloak /bin/bash -ec '
  [[ $(id -u) == 1000 ]]
  for path in \
    /run/secrets/keycloak_db_password \
    /run/secrets/keycloak_bootstrap_admin_password \
    /run/secrets/keycloak_https_key \
    /run/secrets/keycloak_local_user_password
  do
    [[ -s $path && -r $path ]]
  done
'
docker exec --user postgres keycloak-lab-postgres sh -ec '
  [ "$(id -u)" = 999 ]
  [ -s /run/secrets/keycloak_db_password ]
  [ -r /run/secrets/keycloak_db_password ]
'
postgres_secret_writable=$(docker inspect keycloak-lab-postgres \
  --format '{{range .Mounts}}{{if eq .Destination "/run/secrets/keycloak_db_password"}}{{.RW}}{{end}}{{end}}')
if [ "$postgres_secret_writable" != false ]; then
  echo 'PostgreSQL password secret mount is not read-only' >&2
  exit 1
fi

for secret_target in \
  /run/secrets/keycloak_db_password \
  /run/secrets/keycloak_bootstrap_admin_password \
  /run/secrets/keycloak_https_key \
  /run/secrets/keycloak_local_user_password
do
  secret_writable=$(docker inspect keycloak-lab-keycloak \
    --format "{{range .Mounts}}{{if eq .Destination \"$secret_target\"}}{{.RW}}{{end}}{{end}}")
  if [ "$secret_writable" != false ]; then
    echo "Keycloak secret mount is not read-only: $secret_target" >&2
    exit 1
  fi
done

for secret_file in \
  "$state_directory/secrets/keycloak-db-password" \
  "$state_directory/secrets/keycloak-bootstrap-admin-password" \
  "$state_directory/secrets/keycloak-local-user-password"
do
  if docker inspect keycloak-lab-keycloak --format '{{range .Config.Env}}{{println .}}{{end}}' \
    | grep -Fq -- "$(cat "$secret_file")"; then
    echo "secret value from $secret_file leaked into docker inspect environment" >&2
    exit 1
  fi
done

diagnostic_output=$verification_directory/.compose-diagnostic.txt.tmp
if ! "$compose_command" --profile diagnostic run --rm --no-deps diagnostic \
  >"$diagnostic_output"; then
  cat "$diagnostic_output"
  rm -f "$diagnostic_output"
  exit 1
fi
tee "$verification_directory/compose-diagnostic.txt" <"$diagnostic_output"
rm -f "$diagnostic_output"

docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/samba-after-p05.txt"
cmp "$p03_result" "$verification_directory/samba-after-p05.txt"

postgres_volume=$(docker inspect keycloak-lab-postgres \
  --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql"}}{{.Name}}{{end}}{{end}}')
if [ "$postgres_volume" != keycloak-lab-postgres-data ]; then
  echo "unexpected PostgreSQL volume at /var/lib/postgresql: $postgres_volume" >&2
  exit 1
fi

first_realm=$(docker exec --user postgres keycloak-lab-postgres \
  psql --username=keycloak --tuples-only --no-align --dbname=keycloak \
  --command="select name from realm where name = 'study';")
if [ "$first_realm" != study ]; then
  echo 'study realm is missing from PostgreSQL before container recreation' >&2
  exit 1
fi
first_local_user=$(docker exec --user postgres keycloak-lab-postgres \
  psql --username=keycloak --tuples-only --no-align --field-separator='|' --dbname=keycloak \
  --command="select u.username, u.email from user_entity u join realm r on r.id = u.realm_id where r.name = 'study' and u.username = 'local-user';")
if [ "$first_local_user" != 'local-user|local-user@keycloak.test' ]; then
  echo "local-user profile is not ready before container recreation: $first_local_user" >&2
  exit 1
fi
first_local_user_default_role=$(docker exec --user postgres keycloak-lab-postgres \
  psql --username=keycloak --tuples-only --no-align --dbname=keycloak \
  --command="select count(*) from user_role_mapping urm join user_entity u on u.id = urm.user_id join realm r on r.id = u.realm_id join keycloak_role kr on kr.id = urm.role_id where r.name = 'study' and u.username = 'local-user' and kr.name = 'default-roles-study' and kr.realm_id = r.id;")
if [ "$first_local_user_default_role" != 1 ]; then
  echo "local-user is missing the study realm default role before container recreation" >&2
  exit 1
fi

"$compose_command" up --detach --wait --force-recreate postgres keycloak

recreated_realm=$(docker exec --user postgres keycloak-lab-postgres \
  psql --username=keycloak --tuples-only --no-align --dbname=keycloak \
  --command="select name from realm where name = 'study';")
if [ "$recreated_realm" != study ]; then
  echo 'study realm did not survive PostgreSQL and Keycloak container recreation' >&2
  exit 1
fi
recreated_local_user=$(docker exec --user postgres keycloak-lab-postgres \
  psql --username=keycloak --tuples-only --no-align --field-separator='|' --dbname=keycloak \
  --command="select u.username, u.email from user_entity u join realm r on r.id = u.realm_id where r.name = 'study' and u.username = 'local-user';")
if [ "$recreated_local_user" != 'local-user|local-user@keycloak.test' ]; then
  echo "local-user profile did not survive container recreation: $recreated_local_user" >&2
  exit 1
fi
recreated_local_user_default_role=$(docker exec --user postgres keycloak-lab-postgres \
  psql --username=keycloak --tuples-only --no-align --dbname=keycloak \
  --command="select count(*) from user_role_mapping urm join user_entity u on u.id = urm.user_id join realm r on r.id = u.realm_id join keycloak_role kr on kr.id = urm.role_id where r.name = 'study' and u.username = 'local-user' and kr.name = 'default-roles-study' and kr.realm_id = r.id;")
if [ "$recreated_local_user_default_role" != 1 ]; then
  echo "local-user default role did not survive container recreation" >&2
  exit 1
fi

"$compose_command" --profile diagnostic run --rm --no-deps diagnostic \
  >"$verification_directory/compose-diagnostic-after-recreate.txt"
cmp "$verification_directory/compose-diagnostic.txt" \
  "$verification_directory/compose-diagnostic-after-recreate.txt"

docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/samba-after-recreate.txt"
cmp "$p03_result" "$verification_directory/samba-after-recreate.txt"

printf 'runtime_cpus=%s\nruntime_memory_bytes=%s\nmem_available_kib=%s\ndocker_disk_available_kib=%s\n' \
  "$runtime_cpus" "$runtime_memory_bytes" "$available_memory_kib" "$available_disk_kib" \
  >"$verification_directory/resources.txt"
printf 'issuer=%s\npostgres_volume=%s\nstudy_realm=preserved\nlocal_user_profile=preserved\nlocal_user_default_role=preserved\np03_state=unchanged\n' \
  "$issuer" "$postgres_volume" \
  >"$verification_directory/persistence.txt"
printf 'keycloak_uid=1000\nkeycloak_secret_files=readable_read_only\npostgres_uid=999\npostgres_secret_file=readable_read_only\ndiagnostic_uid=65534\ndiagnostic_secret_files=readable_read_only\ninspect_environment_secret_values=absent\n' \
  >"$verification_directory/secrets.txt"

printf 'P05 automated Compose verification passed; browser login remains a separate required check. Evidence is in %s\n' \
  "$verification_directory"
