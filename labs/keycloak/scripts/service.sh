#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/lifecycle-common.sh"

if [ "$#" -ne 2 ]; then
  echo "usage: $0 start|status service" >&2
  exit 2
fi

requested_action=$1
requested_service=$2
container_name_for_service "$requested_service" >/dev/null

case $requested_action in
  status)
    exec "$script_directory/status.sh" "$requested_service"
    ;;
  start)
    require_docker
    require_runtime_capacity
    assert_project_resources_if_present
    assert_port_owners
    require_preserved_state
    cd "$lab_directory"
    compose up --detach --wait "$requested_service"
    exec "$script_directory/status.sh" "$requested_service"
    ;;
  *)
    echo "unsupported action: $requested_action" >&2
    echo "usage: $0 start|status service" >&2
    exit 2
    ;;
esac
