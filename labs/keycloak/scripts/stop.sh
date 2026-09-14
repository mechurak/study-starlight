#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/lifecycle-common.sh"

if [ "$#" -ne 0 ]; then
  echo "usage: $0" >&2
  exit 2
fi

require_docker
assert_project_resources_if_present
require_preserved_state

cd "$lab_directory"
compose down --timeout 30

for service in $service_names; do
  container_name=$(container_name_for_service "$service")
  if docker container inspect "$container_name" >/dev/null 2>&1; then
    echo "container remained after preserved stop: $container_name" >&2
    exit 1
  fi
done
if docker network inspect "$network_name" >/dev/null 2>&1; then
  echo "network remained after preserved stop: $network_name" >&2
  exit 1
fi
require_preserved_state

printf 'stopped project %s; named volumes and %s are preserved\n' "$project_name" "$state_directory"
