#!/bin/sh
set -eu

realm=AD.KEYCLOAK.TEST
base_dn='DC=ad,DC=keycloak,DC=test'
directory_name=dc1.ad.keycloak.test
directory_ip=172.30.0.10
directory_url=ldaps://dc1.ad.keycloak.test:636
directory_ca=/run/keycloak-lab/directory-ca/ca.crt
web_name=keycloak.keycloak.test
web_ip=172.30.0.20
issuer=https://keycloak.keycloak.test:30080/realms/study
web_ca=/run/keycloak-lab/web-ca/ca.crt

assert_readable_secret() {
  secret_path=$1
  if [ ! -s "$secret_path" ] || [ ! -r "$secret_path" ]; then
    echo "diagnostic UID $(id -u) cannot read $secret_path" >&2
    exit 1
  fi
}

for secret_path in \
  /run/secrets/samba_admin_password \
  /run/secrets/samba_alice_password \
  /run/secrets/samba_bob_password
do
  assert_readable_secret "$secret_path"
done

resolved_directory_ip=$(dig +short A "$directory_name" | sed -n '1p')
resolved_web_ip=$(dig +short A "$web_name" | sed -n '1p')
if [ "$resolved_directory_ip" != "$directory_ip" ]; then
  echo "$directory_name resolved to $resolved_directory_ip instead of $directory_ip" >&2
  exit 1
fi
if [ "$resolved_web_ip" != "$web_ip" ]; then
  echo "$web_name resolved to $resolved_web_ip instead of $web_ip" >&2
  exit 1
fi

if ! timeout 10 openssl s_client \
  -connect "$directory_ip:636" \
  -servername "$directory_name" \
  -CAfile "$directory_ca" \
  -verify_return_error </dev/null >/dev/null 2>&1; then
  echo 'directory CA-verified TLS connection failed' >&2
  exit 1
fi

export LDAPTLS_CACERT=$directory_ca
directory_result=$(ldapsearch -LLL -x \
  -H "$directory_url" \
  -D "Administrator@$realm" \
  -w "$(cat /run/secrets/samba_admin_password)" \
  -b "$base_dn" \
  '(|(sAMAccountName=alice)(sAMAccountName=bob)(sAMAccountName=app-users)(sAMAccountName=api-admins))' \
  sAMAccountName member)

for account_name in alice bob app-users api-admins; do
  if ! printf '%s\n' "$directory_result" | grep -Fqx "sAMAccountName: $account_name"; then
    echo "LDAPS search did not return $account_name" >&2
    exit 1
  fi
done

alice_bind=$(ldapwhoami -x -H "$directory_url" -D "alice@$realm" \
  -w "$(cat /run/secrets/samba_alice_password)")
bob_bind=$(ldapwhoami -x -H "$directory_url" -D "bob@$realm" \
  -w "$(cat /run/secrets/samba_bob_password)")
if [ "$alice_bind" != 'u:KEYCLOAK\alice' ] || [ "$bob_bind" != 'u:KEYCLOAK\bob' ]; then
  echo 'alice or bob returned an unexpected bind identity' >&2
  exit 1
fi

if timeout 10 openssl s_client \
  -connect "$directory_ip:636" \
  -servername "$directory_name" \
  -CAfile "$web_ca" \
  -verify_return_error </dev/null >/tmp/wrong-directory-ca.txt 2>&1; then
  echo 'LDAPS TLS verification unexpectedly succeeded with the web CA' >&2
  exit 1
fi
if LDAPTLS_CACERT=$directory_ca ldapwhoami -x -H "$directory_url" \
  -D "alice@$realm" -w 'P05-intentionally-wrong-password' \
  >/tmp/wrong-password.txt 2>&1; then
  echo 'LDAP bind unexpectedly succeeded with a wrong password' >&2
  exit 1
fi

python3 - "$issuer" "$web_ca" "$directory_ca" <<'PY'
import json
import ssl
import sys
import urllib.error
import urllib.request

issuer, web_ca, wrong_ca = sys.argv[1:]
discovery_url = issuer + "/.well-known/openid-configuration"

with urllib.request.urlopen(
    discovery_url,
    context=ssl.create_default_context(cafile=web_ca),
    timeout=10,
) as response:
    discovery = json.load(response)

if discovery.get("issuer") != issuer:
    raise SystemExit(f"unexpected issuer: {discovery.get('issuer')!r}")
jwks_uri = discovery.get("jwks_uri")
if jwks_uri != issuer + "/protocol/openid-connect/certs":
    raise SystemExit(f"unexpected jwks_uri: {jwks_uri!r}")

with urllib.request.urlopen(
    jwks_uri,
    context=ssl.create_default_context(cafile=web_ca),
    timeout=10,
) as response:
    jwks = json.load(response)
if not jwks.get("keys"):
    raise SystemExit("JWKS contains no keys")

try:
    urllib.request.urlopen(
        discovery_url,
        context=ssl.create_default_context(cafile=wrong_ca),
        timeout=10,
    )
except urllib.error.URLError as error:
    if not isinstance(error.reason, ssl.SSLCertVerificationError):
        raise
else:
    raise SystemExit("HTTPS verification unexpectedly succeeded with the directory CA")
PY

printf 'uid=%s\n' "$(id -u)"
printf 'dns=%s->%s,%s->%s\n' "$directory_name" "$resolved_directory_ip" "$web_name" "$resolved_web_ip"
printf 'ldaps_search=alice,bob,app-users,api-admins\n'
printf 'user_binds=alice,bob\n'
printf 'wrong_directory_ca=tls_verification_failed\n'
printf 'wrong_password=bind_failed\n'
printf 'issuer=%s\n' "$issuer"
printf 'discovery_and_jwks=web_ca_verified\n'
printf 'wrong_web_ca=tls_verification_failed\n'
printf 'external_validation_endpoints=none\n'
