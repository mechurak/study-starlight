#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
. "$lab_directory/internal/runtime/lifecycle-common.sh"

usage() { echo "usage: $0 [--guided]" >&2; }
if [ "$#" -eq 0 ]; then requested_mode=ready
elif [ "$#" -eq 1 ] && [ "$1" = --guided ]; then requested_mode=guided
else usage; exit 2
fi

require_docker
require_runtime_capacity
assert_project_resources_if_present
assert_port_owners

first_start_directory=$state_directory/lifecycle
first_start_marker=$first_start_directory/first-start-in-progress
legacy_in_progress=false
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

if [ -f "$first_start_marker" ] && [ -f "$mode_file" ]; then
  requested_mode=$(current_mode)
elif [ -f "$first_start_marker" ]; then
  legacy_in_progress=true
  requested_mode=ready
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
  write_lifecycle_value "$mode_file" "$requested_mode" mode
fi

"$lab_directory/internal/runtime/prepare-p05-state.sh"
"$lab_directory/internal/runtime/prepare-p06-state.sh"
"$lab_directory/internal/runtime/prepare-p07-state.sh"

cd "$lab_directory"
compose up --detach --wait --build samba postgres keycloak
compose --profile guided build app-a-seed
if [ ! -f "$stage_file" ]; then
  if [ "$legacy_in_progress" = true ]; then
    compose --profile guided run --rm stage-inspector base
    write_lifecycle_value "$mode_file" ready mode
  else
    compose --profile guided run --rm stage-inspector base --exact
  fi
  write_lifecycle_value "$stage_file" base stage
else
  mode=$(current_mode)
  stage=$(current_stage)
  if [ "$mode" = guided ]; then lifecycle_exact=--exact; else lifecycle_exact=; fi
  compose --profile guided run --rm stage-inspector "$stage" $lifecycle_exact
fi
stage=$(current_stage)
if [ "$stage" = base ] && [ "$requested_mode" = guided ]; then
  "$script_directory/status.sh"
  rm "$first_start_marker"
  exit 0
fi

for guided_step in app-a app-b api ldap groups; do
  stage=$(current_stage)
  if [ "$(stage_rank "$stage")" -lt "$(stage_rank "$guided_step")" ]; then
    "$script_directory/apply.sh" "$guided_step"
  fi
done
compose --profile p08 run --rm p08-seed
write_lifecycle_value "$mode_file" ready mode
"$script_directory/status.sh"
rm "$first_start_marker"
rmdir "$first_start_directory" 2>/dev/null || true
