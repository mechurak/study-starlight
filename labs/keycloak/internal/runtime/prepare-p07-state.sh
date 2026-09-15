#!/bin/sh
set -eu
# Internal environment preparation; use scripts/first-start.sh.

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/../.." && pwd)
state_directory=$lab_directory/.state
secret_directory=$state_directory/secrets
ca_directory=$state_directory/web-ca

umask 077
mkdir -p "$secret_directory" "$ca_directory"
chmod 0700 "$state_directory" "$secret_directory" "$ca_directory"

require_file() {
  if [ ! -s "$1" ]; then
    echo "required preserved P06 state is missing or empty: $1" >&2
    exit 1
  fi
}

for preserved_file in \
  "$ca_directory/ca.key" \
  "$ca_directory/ca.crt" \
  "$ca_directory/ca.srl" \
  "$ca_directory/keycloak.key" \
  "$ca_directory/keycloak.crt" \
  "$ca_directory/app-a.key" \
  "$ca_directory/app-a.crt" \
  "$secret_directory/keycloak-bootstrap-admin-password" \
  "$secret_directory/keycloak-local-user-password" \
  "$secret_directory/app-a-client-secret" \
  "$secret_directory/app-a-session-secret"
do
  require_file "$preserved_file"
done

create_secret() {
  secret_file=$1
  if [ ! -e "$secret_file" ]; then
    temporary_file=$secret_file.tmp.$$
    printf 'Aa1!%s\n' "$(openssl rand -hex 24)" >"$temporary_file"
    chmod 0600 "$temporary_file"
    mv "$temporary_file" "$secret_file"
  fi
  require_file "$secret_file"
  chmod 0600 "$secret_file"
}

create_secret "$secret_directory/app-b-client-secret"
create_secret "$secret_directory/app-b-session-secret"

if { [ -e "$ca_directory/app-b.key" ] && [ ! -e "$ca_directory/app-b.crt" ]; } || \
   { [ ! -e "$ca_directory/app-b.key" ] && [ -e "$ca_directory/app-b.crt" ]; }; then
  echo 'partial app B certificate state found; refusing to replace it' >&2
  exit 1
fi

if [ ! -e "$ca_directory/app-b.key" ]; then
  openssl req -new -newkey rsa:3072 -sha256 -nodes \
    -keyout "$ca_directory/app-b.key" \
    -out "$ca_directory/app-b.csr" \
    -subj '/CN=app-b.keycloak.test'
  openssl x509 -req -sha256 \
    -days 365 \
    -in "$ca_directory/app-b.csr" \
    -CA "$ca_directory/ca.crt" \
    -CAkey "$ca_directory/ca.key" \
    -CAserial "$ca_directory/ca.srl" \
    -out "$ca_directory/app-b.crt" \
    -extfile "$script_directory/app-b-leaf.ext"
  rm -f "$ca_directory/app-b.csr"
fi

chmod 0600 \
  "$ca_directory/ca.key" \
  "$ca_directory/keycloak.key" \
  "$ca_directory/app-a.key" \
  "$ca_directory/app-b.key"
chmod 0644 \
  "$ca_directory/ca.crt" \
  "$ca_directory/keycloak.crt" \
  "$ca_directory/app-a.crt" \
  "$ca_directory/app-b.crt"

openssl verify -CAfile "$ca_directory/ca.crt" "$ca_directory/app-b.crt"
openssl x509 -checkend 2592000 -noout -in "$ca_directory/ca.crt"
openssl x509 -checkend 2592000 -noout -in "$ca_directory/app-b.crt"

certificate_text=$(openssl x509 -noout -text -in "$ca_directory/app-b.crt")
if ! printf '%s\n' "$certificate_text" | grep -Fq 'DNS:app-b.keycloak.test'; then
  echo 'app B certificate does not contain the required DNS SAN' >&2
  exit 1
fi
if ! printf '%s\n' "$certificate_text" | grep -Fq 'TLS Web Server Authentication'; then
  echo 'app B certificate does not contain the serverAuth EKU' >&2
  exit 1
fi

printf 'prepared private P07 state in %s\n' "$state_directory"
