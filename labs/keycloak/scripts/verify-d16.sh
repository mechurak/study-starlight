#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
state_directory=$lab_directory/.state
verification_directory=$state_directory/verification/d16
compose_command=$lab_directory/samba/compose.sh

for container_name in keycloak-lab-samba keycloak-lab-postgres keycloak-lab-keycloak keycloak-lab-app-a keycloak-lab-app-b keycloak-lab-api; do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
  [ "$status" = running/healthy ] || { echo "required service is not healthy: $container_name ($status)" >&2; exit 1; }
done

"$script_directory/prepare-d16-state.sh"
mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"
find "$verification_directory" -maxdepth 1 -type f -delete

cd "$lab_directory"
"$compose_command" --profile d16 config >"$verification_directory/compose-config.yaml"
"$compose_command" up --detach --wait --force-recreate keycloak
"$compose_command" --profile d16 build d16-seed
"$compose_command" --profile d16 run --rm d16-seed >"$verification_directory/seed.txt"
temporary_seed=$(mktemp "${TMPDIR:-/tmp}/keycloak-d16-seed.XXXXXX")
trap 'rm -f "$temporary_seed"' EXIT HUP INT TERM
"$compose_command" --profile d16 run --rm d16-seed >"$temporary_seed"
cmp "$verification_directory/seed.txt" "$temporary_seed"

"$compose_command" --profile d16 run --rm --no-deps d16-diagnostic >"$verification_directory/broker-login.txt"
grep -Fx 'wrong_upstream_password=rejected' "$verification_directory/broker-login.txt"
grep -Fx 'first_broker_login=callback' "$verification_directory/broker-login.txt"
grep -Fx 'local_user_created=1' "$verification_directory/broker-login.txt"
grep -Fx 'federated_identity=upstream-oidc' "$verification_directory/broker-login.txt"
grep -Fx 'second_broker_login=reused_link' "$verification_directory/broker-login.txt"

for container_name in keycloak-lab-samba keycloak-lab-postgres keycloak-lab-keycloak keycloak-lab-app-a keycloak-lab-app-b keycloak-lab-api; do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}')
  [ "$status" = running/healthy ] || { echo "service changed during D16: $container_name ($status)" >&2; exit 1; }
done

printf 'D16 identity brokering verification passed; evidence: %s\n' "$verification_directory"
