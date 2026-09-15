#!/bin/sh
set -eu
# Internal optional-lab preparation.

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
state_directory=$(CDPATH= cd -- "$script_directory/../../.state" && pwd)
secret_directory=$state_directory/secrets
secret_file=$secret_directory/d18-worker-client-secret

umask 077
mkdir -p "$secret_directory"
chmod 0700 "$state_directory" "$secret_directory"
[ -s "$secret_directory/keycloak-bootstrap-admin-password" ] || {
  echo "required Compose state is missing: $secret_directory/keycloak-bootstrap-admin-password" >&2
  exit 1
}
if [ ! -e "$secret_file" ]; then
  temporary_file=$secret_file.tmp.$$
  printf 'Aa1!%s\n' "$(openssl rand -hex 24)" >"$temporary_file"
  chmod 0600 "$temporary_file"
  mv "$temporary_file" "$secret_file"
fi
[ -s "$secret_file" ] || { echo "generated secret is empty: $secret_file" >&2; exit 1; }
chmod 0600 "$secret_file"
printf 'prepared private D18 service account state in %s\n' "$state_directory"
