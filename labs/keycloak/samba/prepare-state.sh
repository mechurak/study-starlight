#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
state_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)/.state
secret_directory=$state_directory/secrets
ca_directory=$state_directory/directory-ca

umask 077
mkdir -p "$secret_directory" "$ca_directory"
chmod 0700 "$state_directory" "$secret_directory" "$ca_directory"

require_pair() {
  first_path=$1
  second_path=$2

  if { [ -e "$first_path" ] && [ ! -e "$second_path" ]; } || \
     { [ ! -e "$first_path" ] && [ -e "$second_path" ]; }; then
    echo "partial certificate state found: $first_path / $second_path" >&2
    exit 1
  fi
}

create_password() {
  password_path=$1

  if [ ! -e "$password_path" ]; then
    temporary_path=$password_path.tmp.$$
    printf 'Aa1!%s\n' "$(openssl rand -hex 16)" >"$temporary_path"
    chmod 0600 "$temporary_path"
    mv "$temporary_path" "$password_path"
  fi

  if [ ! -s "$password_path" ]; then
    echo "password file is empty: $password_path" >&2
    exit 1
  fi
  chmod 0600 "$password_path"
}

create_password "$secret_directory/samba-admin-password"
create_password "$secret_directory/samba-alice-password"
create_password "$secret_directory/samba-bob-password"

require_pair "$ca_directory/ca.key" "$ca_directory/ca.crt"
if [ ! -e "$ca_directory/ca.key" ]; then
  openssl req -x509 -newkey rsa:3072 -sha256 -nodes \
    -days 3650 \
    -keyout "$ca_directory/ca.key" \
    -out "$ca_directory/ca.crt" \
    -subj '/CN=keycloak-lab-directory-ca' \
    -addext 'basicConstraints=critical,CA:TRUE' \
    -addext 'keyUsage=critical,keyCertSign,cRLSign' \
    -addext 'subjectKeyIdentifier=hash'
fi

require_pair "$ca_directory/dc1.key" "$ca_directory/dc1.crt"
if [ ! -e "$ca_directory/dc1.key" ]; then
  openssl req -new -newkey rsa:3072 -sha256 -nodes \
    -keyout "$ca_directory/dc1.key" \
    -out "$ca_directory/dc1.csr" \
    -subj '/CN=dc1.ad.keycloak.test'
  openssl x509 -req -sha256 \
    -days 365 \
    -in "$ca_directory/dc1.csr" \
    -CA "$ca_directory/ca.crt" \
    -CAkey "$ca_directory/ca.key" \
    -CAserial "$ca_directory/ca.srl" \
    -CAcreateserial \
    -out "$ca_directory/dc1.crt" \
    -extfile "$script_directory/directory-leaf.ext"
  rm -f "$ca_directory/dc1.csr"
fi

chmod 0600 "$ca_directory/ca.key" "$ca_directory/dc1.key"
chmod 0644 "$ca_directory/ca.crt" "$ca_directory/dc1.crt"

openssl verify -CAfile "$ca_directory/ca.crt" "$ca_directory/dc1.crt"
openssl x509 -checkend 2592000 -noout -in "$ca_directory/ca.crt"
openssl x509 -checkend 2592000 -noout -in "$ca_directory/dc1.crt"

certificate_text=$(openssl x509 -noout -text -in "$ca_directory/dc1.crt")
if ! printf '%s\n' "$certificate_text" | grep -Fq 'DNS:dc1.ad.keycloak.test'; then
  echo "directory certificate does not contain the required DNS SAN" >&2
  exit 1
fi
if ! printf '%s\n' "$certificate_text" | grep -Fq 'TLS Web Server Authentication'; then
  echo "directory certificate does not contain the serverAuth EKU" >&2
  exit 1
fi

printf 'prepared private Samba state in %s\n' "$state_directory"
