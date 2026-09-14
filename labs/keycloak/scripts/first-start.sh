#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/lifecycle-common.sh"

require_docker
require_runtime_capacity
assert_project_resources_if_present
assert_port_owners

first_start_directory=$state_directory/lifecycle
first_start_marker=$first_start_directory/first-start-in-progress
existing_project_resources=false
for volume_name in "$samba_volume" "$postgres_volume"; do
  if docker volume inspect "$volume_name" >/dev/null 2>&1; then
    existing_project_resources=true
  fi
done
if docker network inspect "$network_name" >/dev/null 2>&1 || \
   [ -n "$(docker ps -aq --filter label=com.docker.compose.project=keycloak-lab)" ]; then
  existing_project_resources=true
fi

if [ "$existing_project_resources" = true ] && [ ! -f "$first_start_marker" ]; then
  echo 'first start found existing project resources without its in-progress marker' >&2
  echo 'use resume.sh for an existing completed lab state' >&2
  exit 1
fi

if [ "$existing_project_resources" = false ]; then
  case $(uname -s) in
    Darwin) matching_route=$(colima ssh -- ip -o route show match 172.30.0.10 | head -n 1) ;;
    Linux) matching_route=$(ip -o route show match 172.30.0.10 | head -n 1) ;;
  esac
  case $matching_route in
    ''|default\ *) ;;
    *)
      echo "172.30.0.0/24 overlaps an existing route: $matching_route" >&2
      exit 1
      ;;
  esac
  mkdir -p "$first_start_directory"
  chmod 0700 "$state_directory" "$first_start_directory"
  : >"$first_start_marker"
  chmod 0600 "$first_start_marker"
fi

"$script_directory/prepare-p05-state.sh"
"$script_directory/prepare-p06-state.sh"
"$script_directory/prepare-p07-state.sh"

cd "$lab_directory"
compose up --detach --wait --build samba postgres keycloak
compose --profile p06 run --rm app-a-seed
compose --profile p07 build p07-seed
compose --profile p07 run --rm p07-seed
compose --profile p08 build p08-seed
compose --profile p08 run --rm p08-seed
compose up --detach --wait --build api app-a app-b
"$script_directory/status.sh"
rm "$first_start_marker"
rmdir "$first_start_directory" 2>/dev/null || true
