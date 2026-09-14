#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/lifecycle-common.sh"

confirmation_phrase=DELETE-keycloak-lab-compose-state
verification_directory=$state_directory/verification/p11
temporary_directory=
stack_stopped=false
ubuntu_image=ubuntu:24.04@sha256:224a1869083a311ef3f13648a154ba79832fbef6364d31493642ca03082da254

usage() {
  printf 'usage: %s --confirm %s\n' "$0" "$confirmation_phrase" >&2
}

if [ "$#" -ne 2 ] || [ "$1" != --confirm ] || [ "$2" != "$confirmation_phrase" ]; then
  usage
  exit 2
fi

require_file() {
  if [ ! -s "$1" ]; then
    echo "required pre-reset record is missing or empty: $1" >&2
    exit 1
  fi
}

fingerprint_roots() {
  for fingerprint_root in "$@"; do
    if [ -f "$fingerprint_root" ]; then
      shasum -a 256 "$fingerprint_root"
    elif [ -d "$fingerprint_root" ]; then
      find "$fingerprint_root" -type f -print | sort | while IFS= read -r fingerprint_file; do
        shasum -a 256 "$fingerprint_file"
      done
    else
      printf 'absent  %s\n' "$fingerprint_root"
    fi
  done
}

p04_fingerprint() {
  fingerprint_roots \
    "$state_directory/coredns" \
    "$state_directory/kubeconfig" \
    "$state_directory/tools" \
    "$state_directory/verification/p04" \
    "$lab_directory/kind.yaml" \
    "$lab_directory/kind" \
    "$lab_directory/k8s"
}

other_container_state() {
  docker ps -aq | while IFS= read -r container_id; do
    [ -n "$container_id" ] || continue
    container_project=$(docker inspect "$container_id" \
      --format '{{if .Config.Labels}}{{index .Config.Labels "com.docker.compose.project"}}{{end}}')
    [ "$container_project" = "$project_name" ] && continue
    container_health=none
    container_health_config=$(docker inspect "$container_id" --format '{{json .Config.Healthcheck}}')
    case $container_health_config in
      null|'{"Test":["NONE"]}') ;;
      *) container_health=$(docker inspect "$container_id" --format '{{.State.Health.Status}}') ;;
    esac
    docker inspect "$container_id" --format \
      "{{.Id}}|{{.Name}}|{{.Config.Image}}|{{.State.Status}}|{{.State.Running}}|$container_health|{{range .Mounts}}{{.Type}}:{{.Source}}:{{.Destination}}:{{.RW}};{{end}}|{{range \$name, \$_ := .NetworkSettings.Networks}}{{\$name}};{{end}}"
  done | sort
}

other_network_state() {
  docker network ls --format '{{.Name}}' | sort | while IFS= read -r current_network; do
    [ "$current_network" = "$network_name" ] && continue
    docker network inspect "$current_network" --format \
      '{{.Name}}|{{.Driver}}|{{.Scope}}|{{.Internal}}|{{range .IPAM.Config}}{{.Subnet}}:{{.Gateway}};{{end}}|{{json .Labels}}'
  done
}

other_volume_state() {
  docker volume ls --format '{{.Name}}' | sort | while IFS= read -r current_volume; do
    case $current_volume in
      "$samba_volume"|"$postgres_volume") continue ;;
    esac
    docker volume inspect "$current_volume" --format '{{.Name}}|{{.Driver}}|{{json .Labels}}'
  done
}

identity_hashes() {
  for identity_root in "$state_directory/directory-ca" "$state_directory/web-ca" "$state_directory/secrets"; do
    find "$identity_root" -type f -print | sort
  done | while IFS= read -r identity_file; do
    identity_relative=${identity_file#"$state_directory"/}
    identity_hash=$(shasum -a 256 "$identity_file" | awk '{print $1}')
    printf '%s|%s\n' "$identity_relative" "$identity_hash"
  done | sort
}

volume_creation_state() {
  for current_volume in "$samba_volume" "$postgres_volume"; do
    docker volume inspect "$current_volume" --format '{{.Name}}|{{.CreatedAt}}|{{index .Labels "com.docker.compose.project"}}|{{index .Labels "com.docker.compose.volume"}}'
  done | sort
}

runtime_memory() {
  case $(uname -s) in
    Darwin) colima ssh -- awk '/MemAvailable:/ {print $2}' /proc/meminfo ;;
    Linux) awk '/MemAvailable:/ {print $2}' /proc/meminfo ;;
  esac
}

runtime_disk() {
  case $(uname -s) in
    Darwin) colima ssh -- df -Pk /var/lib/docker | awk 'NR == 2 {print $4}' ;;
    Linux)
      runtime_docker_root=$(docker info --format '{{.DockerRootDir}}')
      df -Pk "$runtime_docker_root" | awk 'NR == 2 {print $4}'
      ;;
  esac
}

capture_service_stats() {
  stats_stage=$1
  printf 'stage=%s timestamp=%s mem_available_kib=%s\n' \
    "$stats_stage" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$(runtime_memory)"
  docker stats --no-stream \
    --format '{{.Name}}|cpu={{.CPUPerc}}|memory={{.MemUsage}}|memory_percent={{.MemPerc}}|pids={{.PIDs}}' \
    keycloak-lab-samba keycloak-lab-postgres keycloak-lab-keycloak \
    keycloak-lab-api keycloak-lab-app-a keycloak-lab-app-b | sort
}

run_observed() {
  observed_stage=$1
  observed_output=$2
  shift 2
  observed_stop=$temporary_directory/$observed_stage.stop
  observed_stderr=$temporary_directory/$observed_stage.stderr
  observed_started=$(date +%s)
  (
    while [ ! -e "$observed_stop" ]; do
      capture_service_stats "$observed_stage" || exit 1
      sleep 1
    done
  ) >>"$verification_directory/scenario-resources.txt" &
  observed_sampler=$!
  if "$@" >"$observed_output" 2>"$observed_stderr"; then
    observed_status=0
  else
    observed_status=$?
  fi
  : >"$observed_stop"
  wait "$observed_sampler" || true
  if [ "$observed_status" -ne 0 ]; then
    sed -n '1,120p' "$observed_stderr" >&2
    return "$observed_status"
  fi
  if [ -s "$observed_stderr" ]; then
    mv "$observed_stderr" "$observed_output.stderr.txt"
  else
    rm -f "$observed_stderr"
  fi
  printf '%s_elapsed_seconds=%s\n' "$observed_stage" "$(( $(date +%s) - observed_started ))" \
    >>"$verification_directory/timings.txt"
}

record_environment() {
  {
    printf 'verified_at_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    printf 'host_kernel=%s\n' "$(uname -mrs)"
    printf 'host_architecture=%s\n' "$(uname -m)"
    if [ "$(uname -s)" = Darwin ]; then
      printf 'host_product=%s\n' "$(sw_vers -productName)"
      printf 'host_version=%s\n' "$(sw_vers -productVersion)"
      printf 'host_build=%s\n' "$(sw_vers -buildVersion)"
      printf 'colima_version=%s\n' "$(colima version | sed -n '1s/^colima version //p')"
      printf 'colima_profile=%s\n' "$(colima list | awk '$1 == "default" {print $1 "," $2 "," $3 ",cpus=" $4 ",memory=" $5 ",disk=" $6 ",runtime=" $7}')"
      printf 'runtime_os=%s\n' "$(docker info --format '{{.OperatingSystem}}')"
    fi
    printf 'docker_context=%s\n' "$(docker context show)"
    printf 'docker_client=%s\n' "$(docker version --format '{{.Client.Version}}')"
    printf 'docker_server=%s\n' "$(docker version --format '{{.Server.Version}}')"
    printf 'docker_architecture=%s\n' "$(docker info --format '{{.Architecture}}')"
    printf 'compose=%s\n' "$(compose version --short)"
    printf 'runtime_cpus=%s\n' "$(docker info --format '{{.NCPU}}')"
    printf 'runtime_memory_bytes=%s\n' "$(docker info --format '{{.MemTotal}}')"
    printf 'mem_available_kib=%s\n' "$(runtime_memory)"
    printf 'docker_disk_available_kib=%s\n' "$(runtime_disk)"
  } >"$verification_directory/environment.txt"
}

record_disk_usage() {
  {
    for image_reference in \
      "$ubuntu_image" \
      postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af \
      quay.io/keycloak/keycloak:26.7.3@sha256:ff4257d0d64efbe99ed1ddfaf07765cc3c36dc7518bf8324d41961327f441c54 \
      keycloak-lab-samba:4.19.5-ubuntu24.04 \
      keycloak-lab-app:node24
    do
      image_size=$(docker image inspect "$image_reference" --format '{{.Size}}')
      printf 'image=%s size_bytes=%s\n' "$image_reference" "$image_size"
    done
    for current_volume in "$samba_volume" "$postgres_volume"; do
      volume_size=$(docker run --rm --pull never --network none --read-only \
        --mount "type=volume,source=$current_volume,target=/data,readonly" \
        --entrypoint /usr/bin/du "$ubuntu_image" -sk /data | awk '{print $1}')
      printf 'volume=%s used_kib=%s measurement_network=none image_pull=never\n' \
        "$current_volume" "$volume_size"
    done
    printf 'docker_system_df:\n'
    docker system df --format '{{.Type}}|{{.TotalCount}}|{{.Active}}|{{.Size}}|{{.Reclaimable}}'
  } >"$verification_directory/disk-usage.txt"
}

cleanup() {
  cleanup_status=$?
  trap - EXIT HUP INT TERM
  if [ "$stack_stopped" = true ]; then
    "$script_directory/resume.sh" >&2 || true
  fi
  if [ -n "$temporary_directory" ] && [ -d "$temporary_directory" ]; then
    find "$temporary_directory" -depth -delete
  fi
  exit "$cleanup_status"
}
trap cleanup EXIT HUP INT TERM

require_docker
require_runtime_capacity
assert_project_resources_if_present
"$script_directory/status.sh" >/dev/null
if [ -s "$state_directory/verification/p10/preservation.txt" ]; then
  p10_preservation_record=$state_directory/verification/p10/preservation.txt
elif [ -s "$state_directory/verification/p11/p10-preservation-before-reset.txt" ]; then
  p10_preservation_record=$state_directory/verification/p11/p10-preservation-before-reset.txt
else
  echo 'the P10 preservation record is unavailable before reset' >&2
  exit 1
fi
require_preserved_state

temporary_directory=$(mktemp -d "${TMPDIR:-/tmp}/keycloak-p11-verify.XXXXXX")
p04_fingerprint >"$temporary_directory/p04-before.txt"
other_container_state >"$temporary_directory/other-containers-before.txt"
other_network_state >"$temporary_directory/other-networks-before.txt"
other_volume_state >"$temporary_directory/other-volumes-before.txt"
identity_hashes >"$temporary_directory/identity-before.txt"
volume_creation_state >"$temporary_directory/volumes-before.txt"
cp "$p10_preservation_record" "$temporary_directory/p10-preservation-before-reset.txt"

"$script_directory/reset.sh" --dry-run >"$temporary_directory/reset-dry-run.txt"
"$script_directory/reset.sh" --confirm "$confirmation_phrase" >"$temporary_directory/reset.txt"

if [ -n "$(docker ps -aq --filter "label=com.docker.compose.project=$project_name")" ]; then
  echo 'project containers remained after confirmed reset' >&2
  exit 1
fi
if docker network inspect "$network_name" >/dev/null 2>&1; then
  echo 'project network remained after confirmed reset' >&2
  exit 1
fi
for current_volume in "$samba_volume" "$postgres_volume"; do
  if docker volume inspect "$current_volume" >/dev/null 2>&1; then
    echo "project volume remained after confirmed reset: $current_volume" >&2
    exit 1
  fi
done
for reset_root in \
  "$state_directory/directory-ca" \
  "$state_directory/web-ca" \
  "$state_directory/secrets" \
  "$state_directory/lifecycle"
do
  if [ -e "$reset_root" ]; then
    echo "generated state remained after confirmed reset: $reset_root" >&2
    exit 1
  fi
done
if find "$state_directory/verification" -mindepth 1 -maxdepth 1 ! -name p04 -print | grep -q .; then
  echo 'non-P04 verification state remained after confirmed reset' >&2
  exit 1
fi
p04_fingerprint >"$temporary_directory/p04-after-reset.txt"
cmp "$temporary_directory/p04-before.txt" "$temporary_directory/p04-after-reset.txt"
other_container_state >"$temporary_directory/other-containers-after-reset.txt"
cmp "$temporary_directory/other-containers-before.txt" "$temporary_directory/other-containers-after-reset.txt"
other_network_state >"$temporary_directory/other-networks-after-reset.txt"
cmp "$temporary_directory/other-networks-before.txt" "$temporary_directory/other-networks-after-reset.txt"
other_volume_state >"$temporary_directory/other-volumes-after-reset.txt"
cmp "$temporary_directory/other-volumes-before.txt" "$temporary_directory/other-volumes-after-reset.txt"

first_start_started=$(date +%s)
if ! "$script_directory/first-start.sh" >"$temporary_directory/first-start.txt" 2>"$temporary_directory/first-start.stderr.txt"; then
  sed -n '1,160p' "$temporary_directory/first-start.stderr.txt" >&2
  exit 1
fi
first_start_elapsed=$(( $(date +%s) - first_start_started ))

mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"
mv "$temporary_directory/reset-dry-run.txt" "$verification_directory/reset-dry-run.txt"
mv "$temporary_directory/reset.txt" "$verification_directory/reset.txt"
mv "$temporary_directory/first-start.txt" "$verification_directory/first-start.txt"
if [ -s "$temporary_directory/first-start.stderr.txt" ]; then
  mv "$temporary_directory/first-start.stderr.txt" "$verification_directory/first-start.stderr.txt"
else
  rm -f "$temporary_directory/first-start.stderr.txt"
fi
mv "$temporary_directory/p10-preservation-before-reset.txt" "$verification_directory/p10-preservation-before-reset.txt"
printf 'first_start_elapsed_seconds=%s\n' "$first_start_elapsed" >"$verification_directory/timings.txt"

"$script_directory/status.sh" >"$verification_directory/status-after-first-start.txt"
record_environment
capture_service_stats idle >"$verification_directory/idle-resources.txt"
cd "$lab_directory"
compose --profile p11 config >"$verification_directory/compose-config.yaml"

run_observed local-sso-api "$verification_directory/local-sso-api.txt" \
  compose --profile p07 run --pull never --rm --no-deps p07-diagnostic
run_observed ldap-sync "$verification_directory/ldap-sync.txt" \
  compose --profile p08 run --pull never --rm --no-deps p08-seed
run_observed ad-login-group "$verification_directory/ad-login-group.txt" \
  compose --profile p08 run --pull never --rm --no-deps p08-diagnostic
run_observed refresh "$verification_directory/refresh.txt" \
  compose --profile p11 run --pull never --rm --no-deps p11-diagnostic

docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/directory-after-first-start.txt"
identity_hashes >"$temporary_directory/identity-after-first-start.txt"
if ! awk -F '|' '
  NR == FNR { before[$1] = $2; next }
  $1 in before { seen[$1] = 1; if (before[$1] == $2) bad = 1 }
  END {
    for (path in before) if (!(path in seen)) bad = 1
    exit bad
  }
' "$temporary_directory/identity-before.txt" "$temporary_directory/identity-after-first-start.txt"; then
  echo 'one or more generated CA/key/secret files were not replaced by the confirmed reset' >&2
  exit 1
fi
volume_creation_state >"$temporary_directory/volumes-after-first-start.txt"
if cmp -s "$temporary_directory/volumes-before.txt" "$temporary_directory/volumes-after-first-start.txt"; then
  echo 'named volumes were not recreated after the confirmed reset' >&2
  exit 1
fi
record_disk_usage

identity_hashes >"$temporary_directory/identity-before-stop.txt"
volume_creation_state >"$temporary_directory/volumes-before-stop.txt"
"$script_directory/stop.sh" >"$verification_directory/stop.txt" 2>&1
stack_stopped=true
require_preserved_state
p04_fingerprint >"$temporary_directory/p04-stopped.txt"
cmp "$temporary_directory/p04-before.txt" "$temporary_directory/p04-stopped.txt"
other_container_state >"$temporary_directory/other-containers-stopped.txt"
cmp "$temporary_directory/other-containers-before.txt" "$temporary_directory/other-containers-stopped.txt"
other_network_state >"$temporary_directory/other-networks-stopped.txt"
cmp "$temporary_directory/other-networks-before.txt" "$temporary_directory/other-networks-stopped.txt"
other_volume_state >"$temporary_directory/other-volumes-stopped.txt"
cmp "$temporary_directory/other-volumes-before.txt" "$temporary_directory/other-volumes-stopped.txt"

"$script_directory/resume.sh" >"$verification_directory/resume.txt" 2>&1
stack_stopped=false
"$script_directory/status.sh" >"$verification_directory/status-after-resume.txt"
compose --profile p07 run --pull never --rm --no-deps p07-diagnostic \
  >"$verification_directory/local-sso-api-after-resume.txt"
cmp "$verification_directory/local-sso-api.txt" "$verification_directory/local-sso-api-after-resume.txt"
compose --profile p08 run --pull never --rm --no-deps p08-diagnostic \
  >"$verification_directory/ad-login-group-after-resume.txt"
cmp "$verification_directory/ad-login-group.txt" "$verification_directory/ad-login-group-after-resume.txt"
compose --profile p11 run --pull never --rm --no-deps p11-diagnostic \
  >"$verification_directory/refresh-after-resume.txt"
cmp "$verification_directory/refresh.txt" "$verification_directory/refresh-after-resume.txt"
docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/directory-after-resume.txt"
cmp "$verification_directory/directory-after-first-start.txt" "$verification_directory/directory-after-resume.txt"

identity_hashes >"$temporary_directory/identity-after-resume.txt"
cmp "$temporary_directory/identity-before-stop.txt" "$temporary_directory/identity-after-resume.txt"
volume_creation_state >"$temporary_directory/volumes-after-resume.txt"
cmp "$temporary_directory/volumes-before-stop.txt" "$temporary_directory/volumes-after-resume.txt"
p04_fingerprint >"$temporary_directory/p04-final.txt"
cmp "$temporary_directory/p04-before.txt" "$temporary_directory/p04-final.txt"
other_container_state >"$temporary_directory/other-containers-final.txt"
cmp "$temporary_directory/other-containers-before.txt" "$temporary_directory/other-containers-final.txt"
other_network_state >"$temporary_directory/other-networks-final.txt"
cmp "$temporary_directory/other-networks-before.txt" "$temporary_directory/other-networks-final.txt"
other_volume_state >"$temporary_directory/other-volumes-final.txt"
cmp "$temporary_directory/other-volumes-before.txt" "$temporary_directory/other-volumes-final.txt"
capture_service_stats final >"$verification_directory/final-resources.txt"

if grep -REn 'eyJ[A-Za-z0-9_-]+\.|(^|[?&])code=|app-[ab]\.sid=|KEYCLOAK_SESSION=' "$verification_directory"; then
  echo 'credential, cookie, authorization code, or token-shaped data found in P11 evidence' >&2
  exit 1
fi

printf '%s\n' \
  'confirmed_reset=project_containers,network,named_volumes,generated_compose_state' \
  'generated_identity=regenerated' \
  'p04_kind_assets=preserved' \
  'other_containers_networks_volumes=unchanged' \
  'first_start=empty_state,healthy' \
  'local_sso_api=passed' \
  'ad_login_group_api=passed' \
  'refresh=passed' \
  'preserved_stop_resume=passed' \
  'post_resume_results=unchanged' \
  'diagnostic_image_pull=never' \
  'final_services=healthy' \
  >"$verification_directory/preservation.txt"
cat >"$verification_directory/offline-boundary.txt" <<'EOF'
preparation=first-start may require registry, package, and npm access when pinned images or build cache are absent
diagnostics=p07,p08,p11 and the repeated LDAP seed used local images with pull=never
diagnostic_endpoints=Compose DNS services on keycloak-lab only; no public service endpoint is part of success criteria
volume_measurement=network=none,pull=never
kind_or_kubectl=not_used
EOF

printf 'P11 empty-state Compose verification passed. Evidence is in %s\n' \
  "$verification_directory"
