#!/bin/sh

lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
state_directory=$lab_directory/.state
tool_directory=$state_directory/tools
kubeconfig_path=$state_directory/kubeconfig
kind_binary=$tool_directory/kind-0.33.0
kubectl_binary=$tool_directory/kubectl-1.35.8
cluster_name=keycloak-lab
cluster_context=kind-keycloak-lab
node_name=keycloak-lab-control-plane

sha256_file() {
  openssl dgst -sha256 -r "$1" | awk '{print $1}'
}

global_current_context() {
  if command -v kubectl >/dev/null 2>&1; then
    kubectl config current-context 2>/dev/null || printf '<unset>\n'
  else
    printf '<kubectl-unavailable>\n'
  fi
}

lab_kubectl() {
  "$kubectl_binary" --kubeconfig "$kubeconfig_path" --context "$cluster_context" "$@"
}
