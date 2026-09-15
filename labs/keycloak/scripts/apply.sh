#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
. "$lab_directory/internal/runtime/lifecycle-common.sh"

usage() { echo "usage: $0 app-a|app-b|api|ldap|groups" >&2; }
[ "$#" -eq 1 ] || { usage; exit 2; }
requested_step=$1
case $requested_step in
  app-a) required_stage=base; seed_service=app-a-seed; started_service=app-a; config_paths='keycloak/clients/app-a.json' ;;
  app-b) required_stage=app-a; seed_service=app-b-seed; started_service=app-b; config_paths='keycloak/clients/app-b.json' ;;
  api) required_stage=app-b; seed_service=api-seed; started_service=api; config_paths='keycloak/clients/lab-api.json keycloak/roles/realm-roles.json keycloak/mappings/local-user-roles.json keycloak/mappers/api-audience.json' ;;
  ldap) required_stage=api; seed_service=ldap-seed; started_service=; config_paths='keycloak/federation/samba-ad.json' ;;
  groups) required_stage=ldap; seed_service=groups-seed; started_service=; config_paths='keycloak/federation/ldap-groups.json keycloak/mappings/group-roles.json keycloak/mappers/groups-claim.json' ;;
  *) usage; exit 2 ;;
esac

require_docker
assert_project_resources_if_present
assert_port_owners
require_preserved_state
mode=$(current_mode)
stage=$(current_stage)
if [ "$(stage_rank "$stage")" -lt "$(stage_rank "$required_stage")" ]; then
  echo "cannot apply $requested_step: current stage=$stage; apply through $required_stage first" >&2
  exit 1
fi

cd "$lab_directory"
compose --profile guided run --rm stage-inspector "$required_stage"

printf 'Applying %s from:\n' "$requested_step"
for config_path in $config_paths; do printf '  %s\n' "$config_path"; done
compose --profile guided run --rm "$seed_service"
if [ -n "$started_service" ]; then compose up --detach --wait --build "$started_service"; fi

if [ "$mode" = guided ] && [ -f "$stage_file" ] && \
   [ "$(stage_rank "$requested_step")" -gt "$(stage_rank "$stage")" ]; then
  compose --profile guided run --rm stage-inspector "$requested_step" --exact
else
  compose --profile guided run --rm stage-inspector "$requested_step"
fi

if [ -f "$stage_file" ] && [ "$(stage_rank "$requested_step")" -gt "$(stage_rank "$stage")" ]; then
  write_lifecycle_value "$stage_file" "$requested_step" stage
fi
printf 'stage=%s mode=%s\n' "$(current_stage)" "$mode"
