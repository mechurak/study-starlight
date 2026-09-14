#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
state_directory=$lab_directory/.state
verification_directory=$state_directory/verification/d18
compose_command=$lab_directory/samba/compose.sh

for container_name in keycloak-lab-samba keycloak-lab-postgres keycloak-lab-keycloak keycloak-lab-app-a keycloak-lab-app-b keycloak-lab-api; do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
  [ "$status" = running/healthy ] || { echo "required service is not healthy: $container_name ($status)" >&2; exit 1; }
done

"$script_directory/prepare-d18-state.sh"
mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"
find "$verification_directory" -maxdepth 1 -type f -delete

cd "$lab_directory"
"$compose_command" --profile d18 config >"$verification_directory/compose-config.yaml"
"$compose_command" --profile d18 build d18-seed
"$compose_command" --profile d18 run --rm d18-seed >"$verification_directory/seed.txt"
temporary_seed=$(mktemp "${TMPDIR:-/tmp}/keycloak-d18-seed.XXXXXX")
trap 'rm -f "$temporary_seed"' EXIT HUP INT TERM
"$compose_command" --profile d18 run --rm d18-seed >"$temporary_seed"
cmp "$verification_directory/seed.txt" "$temporary_seed"

"$compose_command" --profile d18 run --rm --no-deps d18-diagnostic >"$verification_directory/service-account.txt"
grep -Fx 'wrong_client_secret=rejected' "$verification_directory/service-account.txt"
grep -Fx 'signature_issuer_audience_exp=verified' "$verification_directory/service-account.txt"
grep -Fx 'roles=app-user,!api-admin' "$verification_directory/service-account.txt"
grep -Fx 'api_without_token=401' "$verification_directory/service-account.txt"
grep -Fx 'api_user=200' "$verification_directory/service-account.txt"
grep -Fx 'api_admin=403' "$verification_directory/service-account.txt"
grep -Fx 'refresh_token=absent' "$verification_directory/service-account.txt"

for container_name in keycloak-lab-samba keycloak-lab-postgres keycloak-lab-keycloak keycloak-lab-app-a keycloak-lab-app-b keycloak-lab-api; do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}')
  [ "$status" = running/healthy ] || { echo "service changed during D18: $container_name ($status)" >&2; exit 1; }
done

printf 'D18 service account verification passed; evidence: %s\n' "$verification_directory"
