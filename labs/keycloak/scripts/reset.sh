#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
. "$lab_directory/internal/runtime/lifecycle-common.sh"

confirmation_phrase=DELETE-keycloak-lab-compose-state

usage() {
  cat <<EOF
usage: $0 --dry-run
       $0 --confirm $confirmation_phrase
EOF
}

if [ "$#" -eq 1 ] && [ "$1" = --dry-run ]; then
  mode=dry-run
elif [ "$#" -eq 2 ] && [ "$1" = --confirm ] && [ "$2" = "$confirmation_phrase" ]; then
  mode=delete
else
  mode=guard
fi

require_docker
assert_project_resources_if_present

state_reset_roots() {
  printf '%s\n' \
    "$state_directory/directory-ca" \
    "$state_directory/web-ca" \
    "$state_directory/secrets" \
    "$state_directory/build" \
    "$state_directory/lifecycle"
  for reset_name in p03 p05 p06 p07 p08 p09 p10 p11 d09 d16 d18 d24 guided; do
    printf '%s\n' "$state_directory/verification/$reset_name"
  done
}

printf 'Compose project: %s\n' "$project_name"
printf 'containers:\n'
docker ps -a --filter "label=com.docker.compose.project=$project_name" \
  --format '  {{.Names}} (service={{.Label "com.docker.compose.service"}})' | sort
printf 'network:\n'
if docker network inspect "$network_name" >/dev/null 2>&1; then
  printf '  %s\n' "$network_name"
else
  printf '  %s (absent)\n' "$network_name"
fi
printf 'named volumes:\n'
for volume_name in "$samba_volume" "$postgres_volume"; do
  if docker volume inspect "$volume_name" >/dev/null 2>&1; then
    printf '  %s\n' "$volume_name"
  else
    printf '  %s (absent)\n' "$volume_name"
  fi
done
printf '.state entries:\n'
state_reset_roots | while IFS= read -r reset_root; do
  [ -n "$reset_root" ] || continue
  if [ -e "$reset_root" ]; then
    find "$reset_root" -print | sort | sed 's/^/  /'
  else
    printf '  %s (absent)\n' "$reset_root"
  fi
done
printf 'Only the listed Compose-owned state is in reset scope; unrelated and historical private state is untouched.\n'

if [ "$mode" = dry-run ]; then
  printf 'dry-run only; no resources or files were deleted\n'
  exit 0
fi
if [ "$mode" = guard ]; then
  printf 'reset refused: explicit confirmation is required\n' >&2
  usage >&2
  exit 2
fi

project_container_ids=$(docker ps -aq --filter "label=com.docker.compose.project=$project_name")
if [ -n "$project_container_ids" ]; then
  docker container rm --force $project_container_ids >/dev/null
fi
if docker network inspect "$network_name" >/dev/null 2>&1; then
  docker network rm "$network_name" >/dev/null
fi
for volume_name in "$samba_volume" "$postgres_volume"; do
  if docker volume inspect "$volume_name" >/dev/null 2>&1; then
    docker volume rm "$volume_name" >/dev/null
  fi
done

state_reset_roots | while IFS= read -r reset_root; do
  [ -n "$reset_root" ] || continue
  case $reset_root in
    "$state_directory"/*) ;;
    *)
      echo "refusing unsafe state reset target: $reset_root" >&2
      exit 1
      ;;
  esac
  if [ -e "$reset_root" ]; then
    find "$reset_root" -depth -delete
  fi
done

printf 'reset completed for the listed %s Compose resources and generated state\n' "$project_name"
