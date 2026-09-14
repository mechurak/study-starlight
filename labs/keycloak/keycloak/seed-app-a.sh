#!/bin/bash
set -euo pipefail

server=https://keycloak.keycloak.test:30080
realm=study
client_id=app-a
client_secret_file=/run/secrets/app_a_client_secret
admin_password_file=/run/secrets/keycloak_bootstrap_admin_password
web_ca_file=/run/keycloak-lab/web-ca/ca.crt
kcadm=/opt/keycloak/bin/kcadm.sh

for required_file in "$client_secret_file" "$admin_password_file" "$web_ca_file"; do
  if [[ ! -s "$required_file" || ! -r "$required_file" ]]; then
    printf 'required app A seed input is missing or unreadable: %s\n' "$required_file" >&2
    exit 1
  fi
done

work_directory=$(mktemp -d /tmp/keycloak-app-a-seed.XXXXXX)
trap 'rm -rf "$work_directory"' EXIT HUP INT TERM
truststore=$work_directory/web-ca.p12
client_file=$work_directory/app-a-client.json

export KC_CLI_PASSWORD
KC_CLI_PASSWORD=$(<"$admin_password_file")
export KC_CLI_TRUSTSTORE_PASSWORD=P06-local-truststore

keytool -importcert -noprompt \
  -alias keycloak-lab-web-ca \
  -file "$web_ca_file" \
  -keystore "$truststore" \
  -storepass:env KC_CLI_TRUSTSTORE_PASSWORD >/dev/null

client_secret=$(<"$client_secret_file")
printf '%s\n' \
  '{' \
  '  "clientId": "app-a",' \
  '  "name": "Keycloak Lab App A",' \
  '  "enabled": true,' \
  '  "protocol": "openid-connect",' \
  '  "clientAuthenticatorType": "client-secret",' \
  '  "publicClient": false,' \
  '  "standardFlowEnabled": true,' \
  '  "implicitFlowEnabled": false,' \
  '  "directAccessGrantsEnabled": false,' \
  '  "serviceAccountsEnabled": false,' \
  '  "redirectUris": ["https://app-a.keycloak.test:30081/callback"],' \
  '  "webOrigins": ["https://app-a.keycloak.test:30081"],' \
  '  "attributes": {' \
  '    "pkce.code.challenge.method": "S256"' \
  '  },' \
  "  \"secret\": \"$client_secret\"" \
  '}' >"$client_file"
chmod 0600 "$client_file" "$truststore"
unset client_secret

kcadm_call() {
  "$kcadm" "$@" \
    --no-config \
    --server "$server" \
    --realm master \
    --user lab-admin \
    --truststore "$truststore"
}

client_ids=$(kcadm_call get clients \
  --target-realm "$realm" \
  --query "clientId=$client_id" \
  --fields id \
  | sed -n 's/.*"id" : "\([^"]*\)".*/\1/p')

set -- $client_ids
case $# in
  0)
    kcadm_call create clients --target-realm "$realm" --file "$client_file" >/dev/null
    ;;
  1)
    kcadm_call update "clients/$1" --target-realm "$realm" --file "$client_file" >/dev/null
    ;;
  *)
    echo 'more than one app-a client exists; refusing to choose one' >&2
    exit 1
    ;;
esac

client_count=$(kcadm_call get clients \
  --target-realm "$realm" \
  --query "clientId=$client_id" \
  --fields id \
  | grep -c '"id" :')
if [[ "$client_count" != 1 ]]; then
  printf 'expected one app-a client after seed, found %s\n' "$client_count" >&2
  exit 1
fi

echo 'app-a client seed applied'
