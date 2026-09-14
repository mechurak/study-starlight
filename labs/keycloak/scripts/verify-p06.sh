#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
state_directory=$lab_directory/.state
verification_directory=$state_directory/verification/p06
compose_command=$lab_directory/samba/compose.sh

require_file() {
  if [ ! -s "$1" ]; then
    echo "required preserved state is missing or empty: $1" >&2
    exit 1
  fi
}

for preserved_file in \
  "$state_directory/verification/p03/before-recreate.txt" \
  "$state_directory/verification/p04/cluster.txt" \
  "$state_directory/verification/p05/persistence.txt" \
  "$state_directory/directory-ca/ca.crt" \
  "$state_directory/web-ca/ca.crt" \
  "$state_directory/web-ca/keycloak.crt" \
  "$state_directory/secrets/keycloak-bootstrap-admin-password" \
  "$state_directory/secrets/keycloak-local-user-password"
do
  require_file "$preserved_file"
done

for container_name in keycloak-lab-samba keycloak-lab-postgres keycloak-lab-keycloak; do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
  if [ "$status" != running/healthy ]; then
    echo "preserved P05 service is not healthy: $container_name ($status)" >&2
    exit 1
  fi
done

network_subnet=$(docker network inspect keycloak-lab --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}' 2>/dev/null || true)
if [ "$network_subnet" != 172.30.0.0/24 ]; then
  echo 'keycloak-lab is not the preserved 172.30.0.0/24 bridge' >&2
  exit 1
fi

port_owner=$(docker ps --filter publish=30081 --format '{{.Names}}' | head -n 1)
if [ -n "$port_owner" ] && [ "$port_owner" != keycloak-lab-app-a ]; then
  echo "host port 30081 is already published by $port_owner" >&2
  exit 1
fi

"$script_directory/prepare-p06-state.sh"
mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"

cd "$lab_directory"
"$compose_command" --profile p06 config >"$verification_directory/compose-config.yaml"
"$compose_command" --profile p06 run --rm app-a-seed \
  >"$verification_directory/client-seed.txt"
second_seed_output=$verification_directory/.client-seed-second.txt.tmp
"$compose_command" --profile p06 run --rm app-a-seed >"$second_seed_output"
cmp "$verification_directory/client-seed.txt" "$second_seed_output"
rm -f "$second_seed_output"
"$compose_command" up --detach --wait --build app-a

host_app_url=https://app-a.keycloak.test:30081/healthz
host_app_health=$(curl --fail --silent --show-error \
  --noproxy '*' \
  --cacert "$state_directory/web-ca/ca.crt" \
  --resolve app-a.keycloak.test:30081:127.0.0.1 \
  "$host_app_url")
if [ "$host_app_health" != ok ]; then
  echo "app A returned an unexpected host health response: $host_app_health" >&2
  exit 1
fi
if curl --fail --silent --show-error \
  --noproxy '*' \
  --cacert "$state_directory/directory-ca/ca.crt" \
  --resolve app-a.keycloak.test:30081:127.0.0.1 \
  "$host_app_url" >/dev/null 2>&1; then
  echo 'app A HTTPS verification unexpectedly succeeded with the directory CA' >&2
  exit 1
fi
printf 'url=%s\nweb_ca=verified\nwrong_directory_ca=tls_verification_failed\n' \
  "$host_app_url" >"$verification_directory/host-https.txt"

app_uid=$(docker exec keycloak-lab-app-a id -u)
if [ "$app_uid" != 1000 ]; then
  echo "app A is not running as Node image UID 1000: $app_uid" >&2
  exit 1
fi
docker exec keycloak-lab-app-a sh -ec '
  for secret_file in \
    /run/secrets/app_a_client_secret \
    /run/secrets/app_a_session_secret \
    /run/secrets/app_a_https_key
  do
    [ -s "$secret_file" ]
    [ -r "$secret_file" ]
  done
'

for secret_target in \
  /run/secrets/app_a_client_secret \
  /run/secrets/app_a_session_secret \
  /run/secrets/app_a_https_key
do
  secret_writable=$(docker inspect keycloak-lab-app-a \
    --format "{{range .Mounts}}{{if eq .Destination \"$secret_target\"}}{{.RW}}{{end}}{{end}}")
  if [ "$secret_writable" != false ]; then
    echo "app A secret mount is not read-only: $secret_target" >&2
    exit 1
  fi
done

app_environment=$verification_directory/.app-environment.txt.tmp
docker inspect keycloak-lab-app-a --format '{{range .Config.Env}}{{println .}}{{end}}' \
  >"$app_environment"
for secret_file in \
  "$state_directory/secrets/app-a-client-secret" \
  "$state_directory/secrets/app-a-session-secret"
do
  if grep -Fq -f "$secret_file" "$app_environment"; then
    echo "secret value from $secret_file leaked into docker inspect environment" >&2
    rm -f "$app_environment"
    exit 1
  fi
done
rm -f "$app_environment"

"$compose_command" --profile p06 run --rm --no-deps app-a-diagnostic \
  >"$verification_directory/oidc-flow.txt"

{
  printf 'app_uid=1000\n'
  docker inspect keycloak-lab-app-a \
    --format 'status={{.State.Status}}
health={{.State.Health.Status}}
cpus={{.HostConfig.NanoCpus}}
memory_bytes={{.HostConfig.Memory}}'
} >"$verification_directory/app-container.txt"
printf 'app_secret_files=readable_read_only\ninspect_environment_secret_values=absent\nclient_seed=idempotent_update\n' \
  >"$verification_directory/secrets.txt"

printf 'P06 non-browser Compose verification passed; browser trust remains a separate check. Evidence is in %s\n' \
  "$verification_directory"
