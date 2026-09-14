#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
state_directory=$lab_directory/.state
verification_directory=$state_directory/verification/p09
compose_command=$lab_directory/samba/compose.sh
p03_result=$state_directory/verification/p03/before-recreate.txt
temporary_directory=
active_scenario=

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
  "$state_directory/verification/p08/federated-login-token-api.txt" \
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
    echo "preserved P08 service is not healthy: $container_name ($status)" >&2
    exit 1
  fi
done

network_state=$(docker network inspect keycloak-lab \
  --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}|{{if .Labels}}{{index .Labels "com.docker.compose.project"}}{{end}}' \
  2>/dev/null || true)
if [ "$network_state" != '172.30.0.0/24|keycloak-lab' ]; then
  echo 'keycloak-lab must remain the Compose-owned 172.30.0.0/24 bridge' >&2
  exit 1
fi

runtime_cpus=$(docker info --format '{{.NCPU}}')
runtime_memory_bytes=$(docker info --format '{{.MemTotal}}')
if [ "$runtime_cpus" -lt 4 ] || [ "$runtime_memory_bytes" -lt 8053063680 ]; then
  echo "P09 requires a 4 CPU/8 GiB runtime; Docker exposed $runtime_cpus CPUs and $runtime_memory_bytes bytes" >&2
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
    echo "unsupported P09 host: $(uname -s)" >&2
    exit 1
    ;;
esac
if [ "$available_memory_kib" -lt 5242880 ]; then
  echo "P09 requires 5 GiB MemAvailable; found $available_memory_kib KiB" >&2
  exit 1
fi
if [ "$available_disk_kib" -lt 20971520 ]; then
  echo "P09 requires 20 GiB free Docker data disk; found $available_disk_kib KiB" >&2
  exit 1
fi

temporary_directory=$(mktemp -d "${TMPDIR:-/tmp}/keycloak-p09-verify.XXXXXX")
mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory" "$temporary_directory"
find "$verification_directory" -maxdepth 1 -type f -delete

preserved_fingerprint() {
  for preserved_root in \
    "$state_directory/directory-ca" \
    "$state_directory/web-ca" \
    "$state_directory/secrets" \
    "$state_directory/verification/p03" \
    "$state_directory/verification/p04" \
    "$state_directory/verification/p05" \
    "$state_directory/verification/p06" \
    "$state_directory/verification/p07" \
    "$state_directory/verification/p08"
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

wait_for_container_file() {
  container_name=$1
  path=$2
  deadline=$(( $(date +%s) + 120 ))
  while ! docker exec "$container_name" test -s "$path" >/dev/null 2>&1; do
    running=$(docker inspect "$container_name" --format '{{.State.Running}}' 2>/dev/null || true)
    if [ "$running" != true ]; then
      echo "$container_name exited before reaching its explicit condition" >&2
      docker logs "$container_name" >&2 || true
      return 1
    fi
    if [ "$(date +%s)" -ge "$deadline" ]; then
      echo "timed out waiting for condition file $path in $container_name" >&2
      return 1
    fi
    sleep 1
  done
}

wait_for_container_exit() {
  container_name=$1
  deadline=$(( $(date +%s) + 120 ))
  while [ "$(docker inspect "$container_name" --format '{{.State.Running}}' 2>/dev/null || true)" = true ]; do
    if [ "$(date +%s)" -ge "$deadline" ]; then
      echo "timed out waiting for $container_name to finish" >&2
      return 1
    fi
    sleep 1
  done
}

wait_for_samba_health() {
  deadline=$(( $(date +%s) + 120 ))
  while [ "$(docker inspect keycloak-lab-samba --format '{{if .State.Health}}{{.State.Health.Status}}{{end}}' 2>/dev/null || true)" != healthy ]; do
    if [ "$(date +%s)" -ge "$deadline" ]; then
      echo 'timed out waiting for Samba health' >&2
      return 1
    fi
    sleep 1
  done
}

run_admin() {
  admin_action=$1
  output_path=$2
  P09_ACTION=$admin_action "$compose_command" --profile p09 run --rm --no-deps \
    --env "P09_ACTION=$admin_action" p09-admin >"$output_path"
}

alice_uac() {
  docker exec keycloak-lab-samba samba-tool user show alice \
    | sed -n 's/^userAccountControl: //p'
}

ensure_source_baseline() {
  if [ "$(docker inspect keycloak-lab-samba --format '{{.State.Running}}' 2>/dev/null || true)" != true ]; then
    docker start keycloak-lab-samba >/dev/null
  fi
  wait_for_samba_health
  current_uac=$(alice_uac)
  if [ $((current_uac & 2)) -ne 0 ]; then
    docker exec keycloak-lab-samba samba-tool user enable alice >/dev/null
  fi
  if ! docker exec keycloak-lab-samba samba-tool group listmembers api-admins | grep -Fqx alice; then
    docker exec keycloak-lab-samba samba-tool group addmembers api-admins alice >/dev/null
  fi
}

restore_scenario() {
  scenario_to_restore=$active_scenario
  [ -n "$scenario_to_restore" ] || return 0
  recovery_started=$(date +%s)
  ensure_source_baseline
  run_admin restore "$verification_directory/$scenario_to_restore-recovery.txt"
  wait_for_samba_health
  docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
    >"$temporary_directory/$scenario_to_restore-directory-restored.txt"
  cmp "$p03_result" "$temporary_directory/$scenario_to_restore-directory-restored.txt"
  recovery_elapsed=$(( $(date +%s) - recovery_started ))
  printf 'source_membership=restored\nsource_account_enabled=restored\nsamba_health=healthy\nkeycloak_federated_state=restored\nrecovery_elapsed_seconds=%s\n' \
    "$recovery_elapsed" >>"$verification_directory/$scenario_to_restore-recovery.txt"
  active_scenario=
}

cleanup_scenario_container() {
  scenario_name=$1
  container_name=keycloak-lab-p09-$scenario_name
  if docker container inspect "$container_name" >/dev/null 2>&1; then
    project_label=$(docker inspect "$container_name" --format '{{index .Config.Labels "com.docker.compose.project"}}')
    service_label=$(docker inspect "$container_name" --format '{{index .Config.Labels "com.docker.compose.service"}}')
    if [ "$project_label" != keycloak-lab ] || [ "$service_label" != p09-diagnostic ]; then
      echo "refusing to remove unexpected container $container_name" >&2
      return 1
    fi
    docker rm --force "$container_name" >/dev/null
  fi
}

cleanup() {
  exit_status=$?
  trap - EXIT HUP INT TERM
  set +e
  restore_scenario
  for scenario_name in group-change account-disabled ldap-outage; do
    cleanup_scenario_container "$scenario_name"
  done
  if [ -n "$temporary_directory" ] && [ -d "$temporary_directory" ]; then
    rm -rf "$temporary_directory"
  fi
  exit "$exit_status"
}
trap cleanup EXIT HUP INT TERM

run_scenario() {
  scenario_name=$1
  active_scenario=$scenario_name
  container_name=keycloak-lab-p09-$scenario_name
  cleanup_scenario_container "$scenario_name"

  "$compose_command" --profile p09 run --detach --no-deps \
    --name "$container_name" \
    --env "P09_SCENARIO=$scenario_name" \
    p09-diagnostic >"$temporary_directory/$scenario_name-container-id.txt"
  wait_for_container_file "$container_name" /tmp/p09-control/ready
  change_started=$(date +%s)

  case $scenario_name in
    group-change)
      docker exec keycloak-lab-samba samba-tool group removemembers api-admins alice >/dev/null
      if docker exec keycloak-lab-samba samba-tool group listmembers api-admins | grep -Fqx alice; then
        echo 'alice is still a Samba api-admins member after removal' >&2
        return 1
      fi
      run_admin group-removed "$verification_directory/group-change-sync.txt"
      ;;
    account-disabled)
      docker exec keycloak-lab-samba samba-tool user disable alice >/dev/null
      current_uac=$(alice_uac)
      if [ $((current_uac & 2)) -eq 0 ]; then
        echo 'alice is still enabled in Samba after disable' >&2
        return 1
      fi
      run_admin user-disabled "$verification_directory/account-disabled-sync.txt"
      ;;
    ldap-outage)
      docker stop --time 30 keycloak-lab-samba >/dev/null
      if [ "$(docker inspect keycloak-lab-samba --format '{{.State.Running}}')" != false ]; then
        echo 'Samba did not reach the stopped condition' >&2
        return 1
      fi
      ;;
  esac

  docker exec "$container_name" touch /tmp/p09-control/change-applied
  wait_for_container_exit "$container_name"
  docker logs "$container_name" >"$verification_directory/$scenario_name.txt" 2>"$verification_directory/$scenario_name.stderr.txt"
  scenario_exit=$(docker inspect "$container_name" --format '{{.State.ExitCode}}')
  if [ "$scenario_exit" != 0 ]; then
    echo "$scenario_name diagnostic failed with exit $scenario_exit" >&2
    sed -n '1,80p' "$verification_directory/$scenario_name.stderr.txt" >&2
    return 1
  fi
  change_elapsed=$(( $(date +%s) - change_started ))
  printf 'source_change_to_diagnostic_exit_seconds=%s\n' "$change_elapsed" \
    >>"$verification_directory/$scenario_name.txt"
  cleanup_scenario_container "$scenario_name"
  restore_scenario
}

preserved_fingerprint >"$temporary_directory/preserved-before.txt"
other_workload_state >"$temporary_directory/other-workload-before.txt"

cd "$lab_directory"
"$compose_command" --profile p09 config >"$verification_directory/compose-config.yaml"
"$compose_command" --profile p09 build p09-admin
ensure_source_baseline
run_admin inspect "$verification_directory/settings.txt"
"$compose_command" --profile p08 run --rm --no-deps p08-diagnostic \
  >"$verification_directory/p08-baseline.txt"
docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/samba-baseline.txt"
cmp "$p03_result" "$verification_directory/samba-baseline.txt"

run_scenario group-change
run_scenario account-disabled
run_scenario ldap-outage

"$compose_command" --profile p08 run --rm --no-deps p08-diagnostic \
  >"$verification_directory/p08-after-recovery.txt"
cmp "$verification_directory/p08-baseline.txt" "$verification_directory/p08-after-recovery.txt"
docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/samba-after-p09.txt"
cmp "$p03_result" "$verification_directory/samba-after-p09.txt"

postgres_volume=$(docker inspect keycloak-lab-postgres \
  --format '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql"}}{{.Name}}{{end}}{{end}}')
samba_volume=$(docker inspect keycloak-lab-samba \
  --format '{{range .Mounts}}{{if eq .Destination "/var/lib/samba"}}{{.Name}}{{end}}{{end}}')
if [ "$postgres_volume" != keycloak-lab-postgres-data ] || [ "$samba_volume" != keycloak-lab-samba-data ]; then
  echo "named volume changed: postgres=$postgres_volume samba=$samba_volume" >&2
  exit 1
fi

preserved_fingerprint >"$temporary_directory/preserved-after.txt"
cmp "$temporary_directory/preserved-before.txt" "$temporary_directory/preserved-after.txt"
other_workload_state >"$temporary_directory/other-workload-after.txt"
cmp "$temporary_directory/other-workload-before.txt" "$temporary_directory/other-workload-after.txt"

for container_name in \
  keycloak-lab-samba \
  keycloak-lab-postgres \
  keycloak-lab-keycloak \
  keycloak-lab-app-a \
  keycloak-lab-app-b \
  keycloak-lab-api
do
  status=$(docker inspect "$container_name" --format '{{.State.Status}}/{{.State.Health.Status}}')
  if [ "$status" != running/healthy ]; then
    echo "service did not recover to healthy: $container_name ($status)" >&2
    exit 1
  fi
done

if grep -REn 'eyJ[A-Za-z0-9_-]+\.|(^|[?&])code=|app-a\.sid=|KEYCLOAK_SESSION=' "$verification_directory"; then
  echo 'credential, cookie, authorization code, or token-shaped data found in P09 evidence' >&2
  exit 1
fi

printf 'runtime_cpus=%s\nruntime_memory_bytes=%s\nmem_available_kib=%s\ndocker_disk_available_kib=%s\n' \
  "$runtime_cpus" "$runtime_memory_bytes" "$available_memory_kib" "$available_disk_kib" \
  >"$verification_directory/resources.txt"
printf 'samba_volume=%s\npostgres_volume=%s\ndomain_and_p03_state=unchanged\np04_p05_p06_p07_p08_records=unchanged\nexisting_ca_and_secrets=unchanged\nother_workloads=unchanged\nfinal_services=healthy\n' \
  "$samba_volume" "$postgres_volume" >"$verification_directory/preservation.txt"

active_scenario=
printf 'P09 non-browser change and outage verification passed. Evidence is in %s\n' \
  "$verification_directory"
