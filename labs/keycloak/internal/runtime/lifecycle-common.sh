#!/bin/sh

set -eu

: "${lab_directory:?public entrypoint must set lab_directory before sourcing lifecycle-common.sh}"
state_directory=$lab_directory/.state
compose_file=$lab_directory/compose.yaml
compose_wrapper=$lab_directory/samba/compose.sh
project_name=keycloak-lab
network_name=keycloak-lab
samba_volume=keycloak-lab-samba-data
postgres_volume=keycloak-lab-postgres-data
service_names='samba postgres keycloak api app-a app-b'
lifecycle_directory=$state_directory/lifecycle
mode_file=$lifecycle_directory/mode
stage_file=$lifecycle_directory/stage

valid_mode() {
  case $1 in guided|ready) return 0 ;; *) return 1 ;; esac
}

valid_stage() {
  case $1 in base|app-a|app-b|api|ldap|groups) return 0 ;; *) return 1 ;; esac
}

read_lifecycle_value() {
  lifecycle_value_file=$1
  lifecycle_value_kind=$2
  [ -f "$lifecycle_value_file" ] || return 1
  IFS= read -r lifecycle_value <"$lifecycle_value_file"
  case $lifecycle_value_kind in
    mode) valid_mode "$lifecycle_value" ;;
    stage) valid_stage "$lifecycle_value" ;;
  esac || {
    echo "invalid lifecycle $lifecycle_value_kind: $lifecycle_value" >&2
    exit 1
  }
  printf '%s\n' "$lifecycle_value"
}

write_lifecycle_value() {
  lifecycle_value_file=$1
  lifecycle_value=$2
  lifecycle_value_kind=$3
  case $lifecycle_value_kind in
    mode) valid_mode "$lifecycle_value" ;;
    stage) valid_stage "$lifecycle_value" ;;
  esac || {
    echo "refusing invalid lifecycle $lifecycle_value_kind: $lifecycle_value" >&2
    exit 1
  }
  mkdir -p "$lifecycle_directory"
  chmod 0700 "$state_directory" "$lifecycle_directory"
  lifecycle_value_tmp=$lifecycle_value_file.tmp.$$
  printf '%s\n' "$lifecycle_value" >"$lifecycle_value_tmp"
  chmod 0600 "$lifecycle_value_tmp"
  mv "$lifecycle_value_tmp" "$lifecycle_value_file"
}

stage_rank() {
  case $1 in base) echo 0 ;; app-a) echo 1 ;; app-b) echo 2 ;; api) echo 3 ;; ldap) echo 4 ;; groups) echo 5 ;; esac
}

services_for_stage() {
  case $1 in
    base) echo 'samba postgres keycloak' ;;
    app-a) echo 'samba postgres keycloak app-a' ;;
    app-b) echo 'samba postgres keycloak app-a app-b' ;;
    api|ldap|groups) echo 'samba postgres keycloak api app-a app-b' ;;
    *) echo "unsupported stage: $1" >&2; return 1 ;;
  esac
}

required_stage_for_service() {
  case $1 in samba|postgres|keycloak) echo base ;; app-a) echo app-a ;; app-b) echo app-b ;; api) echo api ;; esac
}

current_mode() {
  if [ -f "$mode_file" ]; then read_lifecycle_value "$mode_file" mode; else echo ready; fi
}

current_stage() {
  if [ -f "$stage_file" ]; then read_lifecycle_value "$stage_file" stage; else echo groups; fi
}

compose() {
  "$compose_wrapper" --project-name "$project_name" --file "$compose_file" "$@"
}

# Every local image build mounts the corporate proxy CA secret file, so it must exist (possibly
# empty) before any `compose ... --build`. first-start covers this through prepare-p05-state.sh.
prepare_build_state() {
  "$lab_directory/samba/prepare-state.sh" --proxy-ca-only
}

container_name_for_service() {
  case $1 in
    samba) printf '%s\n' keycloak-lab-samba ;;
    postgres) printf '%s\n' keycloak-lab-postgres ;;
    keycloak) printf '%s\n' keycloak-lab-keycloak ;;
    api) printf '%s\n' keycloak-lab-api ;;
    app-a) printf '%s\n' keycloak-lab-app-a ;;
    app-b) printf '%s\n' keycloak-lab-app-b ;;
    *)
      echo "unsupported service: $1" >&2
      echo "allowed services: $service_names" >&2
      return 1
      ;;
  esac
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "required command is unavailable: $1" >&2
    exit 1
  fi
}

require_docker() {
  require_command docker
  if ! docker info >/dev/null 2>&1; then
    echo 'a running Docker runtime is required' >&2
    exit 1
  fi
  if ! compose version >/dev/null 2>&1; then
    echo 'Docker Compose 5.5.1 is required' >&2
    exit 1
  fi
  lifecycle_compose_version=$(compose version --short)
  if [ "$lifecycle_compose_version" != 5.5.1 ]; then
    echo "Docker Compose 5.5.1 is required; found $lifecycle_compose_version" >&2
    exit 1
  fi
  if ! docker buildx version >/dev/null 2>&1; then
    echo 'the docker buildx CLI plugin is required: local image builds mount the corporate proxy CA as a BuildKit secret' >&2
    echo 'macOS Homebrew: brew install docker-buildx && ln -sfn "$(brew --prefix)/opt/docker-buildx/bin/docker-buildx" ~/.docker/cli-plugins/docker-buildx' >&2
    exit 1
  fi
}

require_runtime_capacity() {
  lifecycle_runtime_cpus=$(docker info --format '{{.NCPU}}')
  lifecycle_runtime_memory_bytes=$(docker info --format '{{.MemTotal}}')
  if [ "$lifecycle_runtime_cpus" -lt 4 ] || [ "$lifecycle_runtime_memory_bytes" -lt 8053063680 ]; then
    echo "the lab requires a 4 CPU/8 GiB runtime; Docker exposes $lifecycle_runtime_cpus CPUs and $lifecycle_runtime_memory_bytes bytes" >&2
    exit 1
  fi

  case $(uname -s) in
    Darwin)
      require_command colima
      if [ "$(docker context show)" != colima ]; then
        echo "macOS lifecycle commands require Docker context colima; found $(docker context show)" >&2
        exit 1
      fi
      lifecycle_available_memory_kib=$(colima ssh -- awk '/MemAvailable:/ {print $2}' /proc/meminfo)
      lifecycle_available_disk_kib=$(colima ssh -- df -Pk /var/lib/docker | awk 'NR == 2 {print $4}')
      ;;
    Linux)
      lifecycle_available_memory_kib=$(awk '/MemAvailable:/ {print $2}' /proc/meminfo)
      lifecycle_docker_root=$(docker info --format '{{.DockerRootDir}}')
      lifecycle_available_disk_kib=$(df -Pk "$lifecycle_docker_root" | awk 'NR == 2 {print $4}')
      ;;
    *)
      echo "unsupported lifecycle host: $(uname -s)" >&2
      exit 1
      ;;
  esac

  if [ "$lifecycle_available_memory_kib" -lt 5242880 ]; then
    echo "the lab requires 5 GiB MemAvailable before startup; found $lifecycle_available_memory_kib KiB" >&2
    exit 1
  fi
  if [ "$lifecycle_available_disk_kib" -lt 20971520 ]; then
    echo "the lab requires 20 GiB free Docker data space; found $lifecycle_available_disk_kib KiB" >&2
    exit 1
  fi
}

assert_container_owner_if_present() {
  lifecycle_service=$1
  lifecycle_container_name=$(container_name_for_service "$lifecycle_service")
  if ! docker container inspect "$lifecycle_container_name" >/dev/null 2>&1; then
    return 0
  fi

  lifecycle_owner=$(docker inspect "$lifecycle_container_name" \
    --format '{{index .Config.Labels "com.docker.compose.project"}}|{{index .Config.Labels "com.docker.compose.service"}}')
  if [ "$lifecycle_owner" != "$project_name|$lifecycle_service" ]; then
    echo "refusing unexpected container ownership: $lifecycle_container_name ($lifecycle_owner)" >&2
    exit 1
  fi
}

assert_known_project_containers() {
  for lifecycle_service in $service_names; do
    assert_container_owner_if_present "$lifecycle_service"
  done

  lifecycle_project_containers=$(docker ps -a \
    --filter "label=com.docker.compose.project=$project_name" \
    --format '{{.Names}}|{{.Label "com.docker.compose.service"}}' | sort)
  lifecycle_expected_containers=$(for lifecycle_service in $service_names; do
    lifecycle_container_name=$(container_name_for_service "$lifecycle_service")
    if docker container inspect "$lifecycle_container_name" >/dev/null 2>&1; then
      printf '%s|%s\n' "$lifecycle_container_name" "$lifecycle_service"
    fi
  done | sort)
  if [ "$lifecycle_project_containers" != "$lifecycle_expected_containers" ]; then
    echo 'the project has unexpected or one-off containers; finish or remove them before this lifecycle action' >&2
    printf 'actual:\n%s\nexpected:\n%s\n' "$lifecycle_project_containers" "$lifecycle_expected_containers" >&2
    exit 1
  fi
}

assert_network_owner_if_present() {
  if ! docker network inspect "$network_name" >/dev/null 2>&1; then
    return 0
  fi
  lifecycle_network_owner=$(docker network inspect "$network_name" \
    --format '{{index .Labels "com.docker.compose.project"}}|{{index .Labels "com.docker.compose.network"}}|{{range .IPAM.Config}}{{.Subnet}}{{end}}')
  if [ "$lifecycle_network_owner" != "$project_name|keycloak-lab|172.30.0.0/24" ]; then
    echo "refusing unexpected network ownership or subnet: $network_name ($lifecycle_network_owner)" >&2
    exit 1
  fi
}

assert_volume_owner_if_present() {
  lifecycle_volume_name=$1
  if ! docker volume inspect "$lifecycle_volume_name" >/dev/null 2>&1; then
    return 0
  fi
  lifecycle_volume_owner=$(docker volume inspect "$lifecycle_volume_name" \
    --format '{{index .Labels "com.docker.compose.project"}}|{{index .Labels "com.docker.compose.volume"}}')
  if [ "$lifecycle_volume_owner" != "$project_name|$lifecycle_volume_name" ]; then
    echo "refusing unexpected volume ownership: $lifecycle_volume_name ($lifecycle_volume_owner)" >&2
    exit 1
  fi
}

assert_project_resources_if_present() {
  assert_known_project_containers
  assert_network_owner_if_present
  assert_volume_owner_if_present "$samba_volume"
  assert_volume_owner_if_present "$postgres_volume"
}

require_preserved_state() {
  for lifecycle_volume_name in "$samba_volume" "$postgres_volume"; do
    if ! docker volume inspect "$lifecycle_volume_name" >/dev/null 2>&1; then
      echo "required preserved named volume is missing: $lifecycle_volume_name" >&2
      exit 1
    fi
    assert_volume_owner_if_present "$lifecycle_volume_name"
  done

  for lifecycle_state_file in \
    "$state_directory/directory-ca/ca.crt" \
    "$state_directory/directory-ca/dc1.crt" \
    "$state_directory/directory-ca/dc1.key" \
    "$state_directory/web-ca/ca.crt" \
    "$state_directory/web-ca/keycloak.crt" \
    "$state_directory/web-ca/keycloak.key" \
    "$state_directory/web-ca/app-a.crt" \
    "$state_directory/web-ca/app-a.key" \
    "$state_directory/web-ca/app-b.crt" \
    "$state_directory/web-ca/app-b.key" \
    "$state_directory/secrets/samba-admin-password" \
    "$state_directory/secrets/samba-alice-password" \
    "$state_directory/secrets/samba-bob-password" \
    "$state_directory/secrets/keycloak-db-password" \
    "$state_directory/secrets/keycloak-bootstrap-admin-password" \
    "$state_directory/secrets/keycloak-local-user-password" \
    "$state_directory/secrets/app-a-client-secret" \
    "$state_directory/secrets/app-a-session-secret" \
    "$state_directory/secrets/app-b-client-secret" \
    "$state_directory/secrets/app-b-session-secret"
  do
    if [ ! -s "$lifecycle_state_file" ]; then
      echo "required preserved state is missing or empty: $lifecycle_state_file" >&2
      exit 1
    fi
  done
}

assert_port_owners() {
  for lifecycle_port_mapping in '30080|keycloak-lab-keycloak' '30081|keycloak-lab-app-a' '30082|keycloak-lab-app-b'; do
    lifecycle_port=${lifecycle_port_mapping%%|*}
    lifecycle_expected_owner=${lifecycle_port_mapping#*|}
    lifecycle_owners=$(docker ps --filter "publish=$lifecycle_port" --format '{{.Names}}' | sort)
    case $lifecycle_owners in
      '') ;;
      "$lifecycle_expected_owner") assert_container_owner_if_present "$(docker inspect "$lifecycle_expected_owner" --format '{{index .Config.Labels "com.docker.compose.service"}}')" ;;
      *)
        echo "host port $lifecycle_port is owned by an unexpected container: $lifecycle_owners" >&2
        exit 1
        ;;
    esac
  done
}
