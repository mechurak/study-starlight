#!/bin/bash
set -euo pipefail
# Internal container entrypoint.

read_secret() {
  local variable_name=$1
  local secret_path=$2

  if [[ ! -s "$secret_path" ]]; then
    printf 'required Keycloak secret is missing or empty: %s\n' "$secret_path" >&2
    exit 1
  fi
  if [[ ! -r "$secret_path" ]]; then
    printf 'Keycloak UID %s cannot read secret: %s\n' "$(id -u)" "$secret_path" >&2
    exit 1
  fi

  printf -v "$variable_name" '%s' "$(<"$secret_path")"
  export "$variable_name"
}

if [[ $(id -u) != 1000 ]]; then
  printf 'Keycloak must run as the image service UID 1000; found %s\n' "$(id -u)" >&2
  exit 1
fi

read_secret KC_DB_PASSWORD /run/secrets/keycloak_db_password
read_secret KC_BOOTSTRAP_ADMIN_PASSWORD /run/secrets/keycloak_bootstrap_admin_password
read_secret KEYCLOAK_LAB_LOCAL_USER_PASSWORD /run/secrets/keycloak_local_user_password

for required_file in \
  "$KC_HTTPS_CERTIFICATE_FILE" \
  "$KC_HTTPS_CERTIFICATE_KEY_FILE" \
  "$KC_TRUSTSTORE_PATHS" \
  /opt/keycloak/data/import/study-realm.json
do
  if [[ ! -s "$required_file" || ! -r "$required_file" ]]; then
    printf 'required Keycloak input is missing or unreadable: %s\n' "$required_file" >&2
    exit 1
  fi
done

exec /opt/keycloak/bin/kc.sh start --import-realm
