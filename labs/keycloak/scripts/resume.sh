#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/lifecycle-common.sh"

if [ "$#" -ne 0 ]; then
  echo "usage: $0" >&2
  exit 2
fi

require_docker
require_runtime_capacity
assert_project_resources_if_present
assert_port_owners
require_preserved_state

cd "$lab_directory"
compose up --detach --wait samba postgres keycloak api app-a app-b
"$script_directory/status.sh"
