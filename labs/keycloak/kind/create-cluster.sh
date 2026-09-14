#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/common.sh"

original_context=$(global_current_context)

"$script_directory/prepare-tools.sh"

if ! docker info >/dev/null 2>&1; then
  echo 'P04 requires a running Docker runtime' >&2
  exit 1
fi

if [ "$(uname -s)" = Darwin ]; then
  if ! colima status >/dev/null 2>&1 || [ "$(docker context show)" != colima ]; then
    echo 'P04 on macOS requires the running Colima Docker context' >&2
    exit 1
  fi
elif docker info --format '{{json .SecurityOptions}}' | grep -Fq rootless; then
  echo 'P04 does not support rootless Docker' >&2
  exit 1
fi

if [ "$(docker inspect keycloak-lab-samba --format '{{.State.Health.Status}}' 2>/dev/null || true)" != healthy ]; then
  echo 'the existing keycloak-lab-samba container must be healthy before P04' >&2
  exit 1
fi

network_subnet=$(docker network inspect keycloak-lab --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}' 2>/dev/null || true)
network_project=$(docker network inspect keycloak-lab --format '{{if .Labels}}{{index .Labels "com.docker.compose.project"}}{{end}}' 2>/dev/null || true)
if [ "$network_subnet" != 172.30.0.0/24 ] || [ "$network_project" != keycloak-lab ]; then
  echo 'keycloak-lab must be the P03 Compose-owned 172.30.0.0/24 bridge' >&2
  exit 1
fi

for host_port in 30080 30081 30082; do
  port_owner=$(docker ps --filter "publish=$host_port" --format '{{.Names}}' | head -n 1)
  if [ -n "$port_owner" ] && [ "$port_owner" != "$node_name" ]; then
    echo "host port $host_port is already published by $port_owner" >&2
    exit 1
  fi
done

mkdir -p "$state_directory"
chmod 0700 "$state_directory"

if ! "$kind_binary" get clusters | grep -Fxq "$cluster_name"; then
  KIND_EXPERIMENTAL_PROVIDER=docker "$kind_binary" create cluster \
    --name "$cluster_name" \
    --config "$lab_directory/kind.yaml" \
    --kubeconfig "$kubeconfig_path" \
    --wait 5m
else
  nodes=$("$kind_binary" get nodes --name "$cluster_name")
  if [ "$nodes" != "$node_name" ]; then
    echo "existing $cluster_name cluster does not have the expected single node: $nodes" >&2
    exit 1
  fi
  "$kind_binary" export kubeconfig --name "$cluster_name" --kubeconfig "$kubeconfig_path"
fi
chmod 0600 "$kubeconfig_path"

node_cluster=$(docker inspect "$node_name" --format '{{index .Config.Labels "io.x-k8s.kind.cluster"}}' 2>/dev/null || true)
node_image=$(docker inspect "$node_name" --format '{{.Config.Image}}' 2>/dev/null || true)
expected_node_image='kindest/node:v1.35.8@sha256:07b2536e30b803ed61d1677a79df6115f798ce64c80f9e22f6ed45afd09323c0'
if [ "$node_cluster" != "$cluster_name" ] || [ "$node_image" != "$expected_node_image" ]; then
  echo "existing node is not the pinned $cluster_name control plane: cluster=$node_cluster image=$node_image" >&2
  exit 1
fi

node_lab_address=$(docker inspect "$node_name" --format '{{with index .NetworkSettings.Networks "keycloak-lab"}}{{.IPAddress}}{{end}}')
if [ -z "$node_lab_address" ]; then
  address_owner=$(docker network inspect keycloak-lab \
    --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{println}}{{end}}' \
    | awk '$2 == "172.30.0.20/24" {print $1}')
  if [ -n "$address_owner" ]; then
    echo "172.30.0.20 is already used by $address_owner on keycloak-lab" >&2
    exit 1
  fi
  docker network connect --ip 172.30.0.20 keycloak-lab "$node_name"
  node_lab_address=172.30.0.20
fi
if [ "$node_lab_address" != 172.30.0.20 ]; then
  echo "$node_name has unexpected keycloak-lab address $node_lab_address" >&2
  exit 1
fi

if [ "$("$kubectl_binary" --kubeconfig "$kubeconfig_path" config current-context)" != "$cluster_context" ]; then
  echo "isolated kubeconfig does not select $cluster_context" >&2
  exit 1
fi
lab_kubectl wait --for=condition=Ready node --all --timeout=2m

if [ "$(global_current_context)" != "$original_context" ]; then
  echo 'the host current kubectl context changed unexpectedly' >&2
  exit 1
fi

printf 'prepared cluster=%s context=%s node=%s lab_address=%s\n' \
  "$cluster_name" "$cluster_context" "$node_name" "$node_lab_address"
