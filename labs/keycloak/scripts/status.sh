#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/lifecycle-common.sh"

require_docker
assert_project_resources_if_present

if [ "$#" -gt 1 ]; then
  echo "usage: $0 [service]" >&2
  exit 2
fi

if [ "$#" -eq 1 ]; then
  services=$1
  container_name_for_service "$1" >/dev/null
else
  services=$service_names
fi

failed=false
for service in $services; do
  container_name=$(container_name_for_service "$service")
  state=$(docker inspect "$container_name" \
    --format '{{.State.Status}}/{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' \
    2>/dev/null || true)
  printf '%-10s %s\n' "$service" "${state:-absent}"
  if [ "$state" != running/healthy ]; then
    failed=true
  fi
done

if [ "$failed" = true ]; then
  exit 1
fi
