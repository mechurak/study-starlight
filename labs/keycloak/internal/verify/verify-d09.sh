#!/bin/sh
set -eu
# Historical optional-lab verification.

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/../.." && pwd)
state_directory=$lab_directory/.state
verification_directory=$state_directory/verification/d09
compose_command=$lab_directory/samba/compose.sh

for container_name in keycloak-lab-samba keycloak-lab-postgres keycloak-lab-keycloak keycloak-lab-app-a keycloak-lab-app-b keycloak-lab-api; do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
  if [ "$status" != running/healthy ]; then
    echo "required Compose service is not healthy: $container_name ($status)" >&2
    exit 1
  fi
done

if [ "$(docker info --format '{{.NCPU}}')" -lt 4 ] || [ "$(docker info --format '{{.MemTotal}}')" -lt 8053063680 ]; then
  echo 'D09 requires the established 4 CPU/8 GiB runtime' >&2
  exit 1
fi

case $(uname -s) in
  Darwin) available_memory_kib=$(colima ssh -- awk '/MemAvailable:/ {print $2}' /proc/meminfo) ;;
  Linux) available_memory_kib=$(awk '/MemAvailable:/ {print $2}' /proc/meminfo) ;;
  *) echo "unsupported D09 host: $(uname -s)" >&2; exit 1 ;;
esac
if [ "$available_memory_kib" -lt 5242880 ]; then
  echo "D09 requires 5 GiB MemAvailable; found $available_memory_kib KiB" >&2
  exit 1
fi

temporary_directory=$(mktemp -d "${TMPDIR:-/tmp}/keycloak-d09-verify.XXXXXX")
trap 'rm -rf "$temporary_directory"' EXIT HUP INT TERM
other_workload_state() {
  docker ps --filter name=supabase_ --format '{{.Names}}' | sort | while IFS= read -r name; do
    [ -n "$name" ] || continue
    docker inspect "$name" --format '{{.Name}}|{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}|{{range .Mounts}}{{.Type}}:{{.Name}}:{{.Source}}:{{.Destination}};{{end}}'
  done
}
other_workload_state >"$temporary_directory/other-before.txt"

"$lab_directory/internal/runtime/prepare-d09-state.sh"
mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"
find "$verification_directory" -maxdepth 1 -type f -delete

cd "$lab_directory"
"$compose_command" --profile d09 config >"$verification_directory/compose-config.yaml"
"$compose_command" --profile d09 build d09-seed
"$compose_command" --profile d09 run --rm d09-seed >"$verification_directory/seed.txt"
"$compose_command" --profile d09 run --rm d09-seed >"$temporary_directory/seed-second.txt"
cmp "$verification_directory/seed.txt" "$temporary_directory/seed-second.txt"

"$compose_command" --profile d09 run --rm --no-deps d09-diagnostic >"$verification_directory/mfa-flow.txt"

grep -Fx 'first_login=configure_otp_then_callback' "$verification_directory/mfa-flow.txt"
grep -Fx 'wrong_otp=rejected' "$verification_directory/mfa-flow.txt"
grep -Fx 'correct_password_and_otp=callback' "$verification_directory/mfa-flow.txt"
grep -Fx 'recovery=delete_credential_require_reenrollment' "$verification_directory/mfa-flow.txt"
grep -Fx 'recovery_login=configure_otp_then_callback' "$verification_directory/mfa-flow.txt"
grep -Fx 'final_otp_credentials=1' "$verification_directory/mfa-flow.txt"

other_workload_state >"$temporary_directory/other-after.txt"
cmp "$temporary_directory/other-before.txt" "$temporary_directory/other-after.txt"

for container_name in keycloak-lab-samba keycloak-lab-postgres keycloak-lab-keycloak keycloak-lab-app-a keycloak-lab-app-b keycloak-lab-api; do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}')
  [ "$status" = running/healthy ] || { echo "service changed during D09: $container_name ($status)" >&2; exit 1; }
done

printf 'D09 MFA verification passed; evidence: %s\n' "$verification_directory"
