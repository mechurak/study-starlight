#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
. "$lab_directory/internal/runtime/lifecycle-common.sh"

require_docker
assert_project_resources_if_present

if [ "$#" -gt 1 ]; then
  echo "usage: $0 [service]" >&2
  exit 2
fi

mode=$(current_mode)
stage=$(current_stage)

if [ "$#" -eq 1 ]; then
  services=$1
  container_name_for_service "$1" >/dev/null
  requested_stage=$(required_stage_for_service "$1")
  if [ "$(stage_rank "$stage")" -lt "$(stage_rank "$requested_stage")" ]; then
    echo "service $1 is not expected at stage $stage; apply through $requested_stage first" >&2
    exit 1
  fi
else
  services=$(services_for_stage "$stage")
fi

printf 'mode=%s stage=%s\n' "$mode" "$stage"

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

if [ "$#" -eq 0 ]; then
  for service in $service_names; do
    case " $services " in *" $service "*) continue ;; esac
    printf '%-10s %s\n' "$service" 'not-started (expected at a later stage)'
  done
fi

if [ "$failed" = true ]; then
  exit 1
fi
