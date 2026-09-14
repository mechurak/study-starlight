#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
state_directory=$(CDPATH= cd -- "$script_directory/../.state" && pwd)
secret_directory=$state_directory/secrets

umask 077
mkdir -p "$secret_directory"
chmod 0700 "$state_directory" "$secret_directory"

for required_file in \
  "$state_directory/web-ca/ca.crt" \
  "$secret_directory/keycloak-bootstrap-admin-password"
do
  if [ ! -s "$required_file" ]; then
    echo "required preserved Compose state is missing: $required_file" >&2
    exit 1
  fi
done

secret_file=$secret_directory/d09-mfa-user-password
if [ ! -e "$secret_file" ]; then
  temporary_file=$secret_file.tmp.$$
  printf 'Aa1!%s\n' "$(openssl rand -hex 24)" >"$temporary_file"
  chmod 0600 "$temporary_file"
  mv "$temporary_file" "$secret_file"
fi

if [ ! -s "$secret_file" ]; then
  echo "D09 MFA password secret is empty: $secret_file" >&2
  exit 1
fi
chmod 0600 "$secret_file"
printf 'prepared private D09 MFA state in %s\n' "$state_directory"
