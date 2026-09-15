#!/bin/sh
set -eu
# Historical detailed verification; use scripts/verify.sh for guided checks.

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/../.." && pwd)
. "$lab_directory/internal/runtime/lifecycle-common.sh"

verification_directory=$state_directory/verification/p10
p03_result=$state_directory/verification/p03/before-recreate.txt
temporary_directory=
stack_stopped=false

require_file() {
  if [ ! -s "$1" ]; then
    echo "required preserved state is missing or empty: $1" >&2
    exit 1
  fi
}

for preserved_file in \
  "$p03_result" \
  "$state_directory/verification/p05/persistence.txt" \
  "$state_directory/verification/p06/oidc-flow.txt" \
  "$state_directory/verification/p07/sso-and-api.txt" \
  "$state_directory/verification/p08/federated-login-token-api.txt" \
  "$state_directory/verification/p09/preservation.txt"
do
  require_file "$preserved_file"
done

require_docker
require_runtime_capacity
assert_project_resources_if_present
require_preserved_state

mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"
find "$verification_directory" -maxdepth 1 -type f -delete
temporary_directory=$(mktemp -d "${TMPDIR:-/tmp}/keycloak-p10-verify.XXXXXX")

cleanup() {
  exit_status=$?
  trap - EXIT HUP INT TERM
  if [ "$stack_stopped" = true ]; then
    "$lab_directory/scripts/resume.sh" >&2 || true
  fi
  if [ -n "$temporary_directory" ] && [ -d "$temporary_directory" ]; then
    rm -rf "$temporary_directory"
  fi
  exit "$exit_status"
}
trap cleanup EXIT HUP INT TERM

preserved_state_fingerprint() {
  for preserved_root in \
    "$state_directory/directory-ca" \
    "$state_directory/web-ca" \
    "$state_directory/secrets" \
    "$state_directory/verification/p03" \
    "$state_directory/verification/p05" \
    "$state_directory/verification/p06" \
    "$state_directory/verification/p07" \
    "$state_directory/verification/p08" \
    "$state_directory/verification/p09"
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

volume_state() {
  for volume_name in "$samba_volume" "$postgres_volume"; do
    docker volume inspect "$volume_name" \
      --format '{{.Name}}|{{.Driver}}|{{index .Labels "com.docker.compose.project"}}|{{index .Labels "com.docker.compose.volume"}}'
  done
}

mounted_volume_state() {
  docker inspect keycloak-lab-samba \
    --format '{{range .Mounts}}{{if eq .Destination "/var/lib/samba"}}{{.Name}}{{end}}{{end}}'
  docker inspect keycloak-lab-postgres \
    --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql"}}{{.Name}}{{end}}{{end}}'
}

cd "$lab_directory"
"$lab_directory/scripts/status.sh" >"$verification_directory/status-before.txt"
compose --profile p08 run --rm --no-deps p08-diagnostic \
  >"$verification_directory/p08-before.txt"
P09_ACTION=inspect compose --profile p09 run --rm --no-deps \
  --env P09_ACTION=inspect p09-admin >"$verification_directory/p09-before.txt"
docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/directory-before.txt"
cmp "$p03_result" "$verification_directory/directory-before.txt"

preserved_state_fingerprint >"$temporary_directory/state-before.txt"
other_workload_state >"$temporary_directory/other-workloads-before.txt"
volume_state >"$temporary_directory/volumes-before.txt"
mounted_volume_state >"$temporary_directory/mounted-volumes-before.txt"

"$lab_directory/scripts/reset.sh" --dry-run >"$verification_directory/reset-dry-run.txt"
if "$lab_directory/scripts/reset.sh" >"$verification_directory/reset-guard.txt" 2>&1; then
  echo 'reset guard unexpectedly accepted a request without confirmation' >&2
  exit 1
fi
preserved_state_fingerprint >"$temporary_directory/state-after-reset-guard.txt"
cmp "$temporary_directory/state-before.txt" "$temporary_directory/state-after-reset-guard.txt"
other_workload_state >"$temporary_directory/other-workloads-after-reset-guard.txt"
cmp "$temporary_directory/other-workloads-before.txt" "$temporary_directory/other-workloads-after-reset-guard.txt"
volume_state >"$temporary_directory/volumes-after-reset-guard.txt"
cmp "$temporary_directory/volumes-before.txt" "$temporary_directory/volumes-after-reset-guard.txt"

"$lab_directory/scripts/stop.sh" >"$verification_directory/stop.txt" 2>&1
stack_stopped=true
if [ -n "$(docker ps -aq --filter label=com.docker.compose.project=keycloak-lab)" ]; then
  echo 'keycloak-lab containers remained after preserved stop' >&2
  exit 1
fi
if docker network inspect "$network_name" >/dev/null 2>&1; then
  echo 'keycloak-lab network remained after preserved stop' >&2
  exit 1
fi
require_preserved_state
preserved_state_fingerprint >"$temporary_directory/state-stopped.txt"
cmp "$temporary_directory/state-before.txt" "$temporary_directory/state-stopped.txt"
other_workload_state >"$temporary_directory/other-workloads-stopped.txt"
cmp "$temporary_directory/other-workloads-before.txt" "$temporary_directory/other-workloads-stopped.txt"
volume_state >"$temporary_directory/volumes-stopped.txt"
cmp "$temporary_directory/volumes-before.txt" "$temporary_directory/volumes-stopped.txt"
printf 'containers=absent\nnetwork=absent\nnamed_volumes=preserved\n.state=preserved\nother_workloads=unchanged\n' \
  >"$verification_directory/stopped-state.txt"

"$lab_directory/scripts/resume.sh" >"$verification_directory/resume.txt" 2>&1
stack_stopped=false
"$lab_directory/scripts/status.sh" >"$verification_directory/status-after.txt"

docker stop --time 15 keycloak-lab-api >/dev/null
api_stopped=$(docker inspect keycloak-lab-api --format '{{.State.Status}}/{{.State.Running}}')
if [ "$api_stopped" != exited/false ]; then
  echo "API did not reach the stopped condition: $api_stopped" >&2
  exit 1
fi
printf 'before_start=%s\n' "$api_stopped" >"$verification_directory/service-api-start.txt"
"$script_directory/service.sh" start api >>"$verification_directory/service-api-start.txt" 2>&1
"$script_directory/service.sh" status api >>"$verification_directory/service-api-start.txt"

compose --profile p08 run --rm --no-deps p08-diagnostic \
  >"$verification_directory/p08-after.txt"
cmp "$verification_directory/p08-before.txt" "$verification_directory/p08-after.txt"
P09_ACTION=inspect compose --profile p09 run --rm --no-deps \
  --env P09_ACTION=inspect p09-admin >"$verification_directory/p09-after.txt"
cmp "$verification_directory/p09-before.txt" "$verification_directory/p09-after.txt"
docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/directory-after.txt"
cmp "$p03_result" "$verification_directory/directory-after.txt"

mounted_volume_state >"$temporary_directory/mounted-volumes-after.txt"
cmp "$temporary_directory/mounted-volumes-before.txt" "$temporary_directory/mounted-volumes-after.txt"
preserved_state_fingerprint >"$temporary_directory/state-after.txt"
cmp "$temporary_directory/state-before.txt" "$temporary_directory/state-after.txt"
other_workload_state >"$temporary_directory/other-workloads-after.txt"
cmp "$temporary_directory/other-workloads-before.txt" "$temporary_directory/other-workloads-after.txt"
volume_state >"$temporary_directory/volumes-after.txt"
cmp "$temporary_directory/volumes-before.txt" "$temporary_directory/volumes-after.txt"

runtime_cpus=$(docker info --format '{{.NCPU}}')
runtime_memory_bytes=$(docker info --format '{{.MemTotal}}')
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
esac
printf 'runtime_cpus=%s\nruntime_memory_bytes=%s\nmem_available_kib=%s\ndocker_disk_available_kib=%s\n' \
  "$runtime_cpus" "$runtime_memory_bytes" "$available_memory_kib" "$available_disk_kib" \
  >"$verification_directory/resources.txt"
printf 'samba_volume=%s\npostgres_volume=%s\ndomain_and_p03_state=unchanged\np05_p06_p07_p08_p09_records=unchanged\nexisting_ca_and_secrets=unchanged\nother_workloads=unchanged\nfinal_services=healthy\nreset=dry_run_and_guard_only\n' \
  "$samba_volume" "$postgres_volume" >"$verification_directory/preservation.txt"

printf 'P10 preserved stop/resume verification passed. Evidence is in %s\n' \
  "$verification_directory"
