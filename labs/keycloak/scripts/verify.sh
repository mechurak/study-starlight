#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
. "$lab_directory/internal/runtime/lifecycle-common.sh"

usage() { echo "usage: $0 app-a|sso|api|ldap|groups" >&2; }
[ "$#" -eq 1 ] || { usage; exit 2; }
check=$1
case $check in
  app-a) required_stage=app-a; diagnostic=guided-local ;;
  sso) required_stage=app-b; diagnostic=guided-local ;;
  api) required_stage=api; diagnostic=guided-local ;;
  ldap) required_stage=ldap; diagnostic=guided-directory ;;
  groups) required_stage=groups; diagnostic=guided-directory ;;
  *) usage; exit 2 ;;
esac
require_docker
assert_project_resources_if_present
stage=$(current_stage)
if [ "$(stage_rank "$stage")" -lt "$(stage_rank "$required_stage")" ]; then
  echo "cannot verify $check: expected stage >= $required_stage; observed stage=$stage" >&2
  exit 1
fi
cd "$lab_directory"
compose --profile guided run --rm --no-deps "$diagnostic" "$check"
