#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/common.sh"

"$script_directory/create-cluster.sh"
"$lab_directory/samba/prepare-state.sh"

if ! docker image inspect keycloak-lab-samba:4.19.5-ubuntu24.04 >/dev/null 2>&1; then
  echo 'the P03 keycloak-lab-samba image must exist locally before P04' >&2
  exit 1
fi

KIND_EXPERIMENTAL_PROVIDER=docker "$kind_binary" load docker-image \
  keycloak-lab-samba:4.19.5-ubuntu24.04 --name "$cluster_name"

coredns_state_directory=$state_directory/coredns
mkdir -p "$coredns_state_directory"
chmod 0700 "$coredns_state_directory"
current_corefile=$coredns_state_directory/Corefile.current
new_corefile=$coredns_state_directory/Corefile.p04
lab_kubectl --namespace kube-system get configmap coredns \
  --output jsonpath='{.data.Corefile}' >"$current_corefile"
if [ ! -e "$coredns_state_directory/Corefile.before-p04" ]; then
  cp "$current_corefile" "$coredns_state_directory/Corefile.before-p04"
fi

awk '
  /# BEGIN keycloak-lab static hosts/ {skip = 1; next}
  /# END keycloak-lab static hosts/ {skip = 0; next}
  skip {next}
  !inserted && $1 == "forward" {
    print "    # BEGIN keycloak-lab static hosts"
    print "    hosts {"
    print "        172.30.0.10 dc1.ad.keycloak.test"
    print "        172.30.0.20 keycloak.keycloak.test app-a.keycloak.test app-b.keycloak.test"
    print "        fallthrough"
    print "    }"
    print "    # END keycloak-lab static hosts"
    inserted = 1
  }
  {print}
  END {if (!inserted) exit 42}
' "$current_corefile" >"$new_corefile" || {
  echo 'could not insert the keycloak-lab hosts block into the existing CoreDNS Corefile' >&2
  exit 1
}

lab_kubectl --namespace kube-system create configmap coredns \
  --from-file="Corefile=$new_corefile" \
  --dry-run=client --output yaml \
  | lab_kubectl apply --filename -
lab_kubectl --namespace kube-system rollout restart deployment/coredns
lab_kubectl --namespace kube-system rollout status deployment/coredns --timeout=2m

lab_kubectl create namespace keycloak-lab --dry-run=client --output yaml \
  | lab_kubectl apply --filename -
lab_kubectl --namespace keycloak-lab create configmap directory-ca \
  --from-file="ca.crt=$state_directory/directory-ca/ca.crt" \
  --dry-run=client --output yaml \
  | lab_kubectl apply --filename -
lab_kubectl --namespace keycloak-lab create configmap directory-diagnostic-script \
  --from-file="verify-from-pod.sh=$script_directory/verify-from-pod.sh" \
  --dry-run=client --output yaml \
  | lab_kubectl apply --filename -
lab_kubectl --namespace keycloak-lab create secret generic directory-diagnostic-bind \
  --from-file="admin-password=$state_directory/secrets/samba-admin-password" \
  --from-file="alice-password=$state_directory/secrets/samba-alice-password" \
  --from-file="bob-password=$state_directory/secrets/samba-bob-password" \
  --dry-run=client --output yaml \
  | lab_kubectl apply --filename -

lab_kubectl --namespace keycloak-lab delete pod directory-diagnostic \
  --ignore-not-found --wait=true
lab_kubectl apply --filename "$lab_directory/k8s/directory-diagnostic.yaml"
lab_kubectl --namespace keycloak-lab wait \
  --for=condition=Ready pod/directory-diagnostic --timeout=2m

printf 'configured CoreDNS, directory CA, bind secret, and diagnostic Pod in %s\n' "$cluster_context"
