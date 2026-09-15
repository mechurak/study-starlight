#!/bin/sh
set -eu
# Internal optional-lab preparation.

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
state_directory=$(CDPATH= cd -- "$script_directory/../../.state" && pwd)
secret_directory=$state_directory/secrets

umask 077
mkdir -p "$secret_directory"
chmod 0700 "$state_directory" "$secret_directory"

for required_file in \
  "$state_directory/web-ca/ca.crt" \
  "$secret_directory/keycloak-bootstrap-admin-password"
do
  [ -s "$required_file" ] || { echo "required Compose state is missing: $required_file" >&2; exit 1; }
done

create_secret() {
  secret_file=$1
  if [ ! -e "$secret_file" ]; then
    temporary_file=$secret_file.tmp.$$
    printf 'Aa1!%s\n' "$(openssl rand -hex 24)" >"$temporary_file"
    chmod 0600 "$temporary_file"
    mv "$temporary_file" "$secret_file"
  fi
  [ -s "$secret_file" ] || { echo "generated secret is empty: $secret_file" >&2; exit 1; }
  chmod 0600 "$secret_file"
}

create_secret "$secret_directory/d16-upstream-client-secret"
create_secret "$secret_directory/d16-upstream-user-password"
printf 'prepared private D16 brokering state in %s\n' "$state_directory"
