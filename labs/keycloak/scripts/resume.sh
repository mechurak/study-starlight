#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
. "$lab_directory/internal/runtime/lifecycle-common.sh"

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
stage=$(current_stage)
services=$(services_for_stage "$stage")
compose up --detach --wait $services
"$script_directory/status.sh"
