#!/bin/sh
set -eu

realm=AD.KEYCLOAK.TEST
base_dn='DC=ad,DC=keycloak,DC=test'
directory_name=dc1.ad.keycloak.test
directory_ip=172.30.0.10
ldap_url=ldaps://dc1.ad.keycloak.test:636
ca_file=/run/keycloak-lab/directory-ca/ca.crt
secret_directory=/run/keycloak-lab/secrets

resolved_address=$(dig +short A "$directory_name" | sed -n '1p')
if [ "$resolved_address" != "$directory_ip" ]; then
  echo "$directory_name resolved to $resolved_address instead of $directory_ip" >&2
  exit 1
fi

if ! timeout 10 openssl s_client \
  -connect "$directory_ip:636" \
  -servername "$directory_name" \
  -CAfile "$ca_file" \
  -verify_return_error </dev/null >/dev/null 2>&1; then
  echo "could not establish a CA-verified TLS connection to $directory_ip:636" >&2
  exit 1
fi

export LDAPTLS_CACERT=$ca_file
directory_result=$(ldapsearch -LLL -x \
  -H "$ldap_url" \
  -D "Administrator@$realm" \
  -w "$(cat "$secret_directory/admin-password")" \
  -b "$base_dn" \
  '(|(sAMAccountName=alice)(sAMAccountName=bob)(sAMAccountName=app-users)(sAMAccountName=api-admins))' \
  sAMAccountName member)

for account_name in alice bob app-users api-admins; do
  if ! printf '%s\n' "$directory_result" | grep -Fqx "sAMAccountName: $account_name"; then
    echo "LDAPS search did not return $account_name" >&2
    exit 1
  fi
done

alice_bind=$(ldapwhoami -x -H "$ldap_url" -D "alice@$realm" \
  -w "$(cat "$secret_directory/alice-password")")
bob_bind=$(ldapwhoami -x -H "$ldap_url" -D "bob@$realm" \
  -w "$(cat "$secret_directory/bob-password")")
if [ "$alice_bind" != 'u:KEYCLOAK\alice' ] || [ "$bob_bind" != 'u:KEYCLOAK\bob' ]; then
  echo 'alice or bob returned an unexpected bind identity' >&2
  exit 1
fi

if timeout 10 openssl s_client \
  -connect "$directory_ip:636" \
  -servername "$directory_name" \
  -CAfile /etc/ssl/certs/ca-certificates.crt \
  -verify_return_error </dev/null >/tmp/wrong-ca.txt 2>&1; then
  echo 'TLS verification unexpectedly succeeded with the system CA bundle' >&2
  exit 1
fi

if ldapwhoami -x -H "$ldap_url" -D "alice@$realm" \
  -w 'P04-intentionally-wrong-password' >/tmp/wrong-password.txt 2>&1; then
  echo 'LDAP bind unexpectedly succeeded with a wrong password' >&2
  exit 1
fi

printf 'dns=%s->%s\n' "$directory_name" "$resolved_address"
printf 'network=%s:636 reachable\n' "$directory_ip"
printf 'ldaps_search=alice,bob,app-users,api-admins\n'
printf 'user_binds=alice,bob\n'
printf 'wrong_ca=tls_verification_failed\n'
printf 'wrong_password=bind_failed\n'
