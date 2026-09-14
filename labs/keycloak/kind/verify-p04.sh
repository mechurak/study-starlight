#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/common.sh"

verification_directory=$state_directory/verification/p04
p03_result=$state_directory/verification/p03/before-recreate.txt
original_context=$(global_current_context)
hosts_before=$(sha256_file /etc/hosts)

mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"

if [ ! -s "$p03_result" ]; then
  echo "P04 requires the P03 result at $p03_result" >&2
  exit 1
fi

"$script_directory/configure-directory-access.sh"

node_lab_address=$(docker inspect "$node_name" \
  --format '{{with index .NetworkSettings.Networks "keycloak-lab"}}{{.IPAddress}}{{end}}')
samba_lab_address=$(docker inspect keycloak-lab-samba \
  --format '{{with index .NetworkSettings.Networks "keycloak-lab"}}{{.IPAddress}}{{end}}')
if [ "$node_lab_address" != 172.30.0.20 ] || [ "$samba_lab_address" != 172.30.0.10 ]; then
  echo "unexpected bridge addresses: node=$node_lab_address samba=$samba_lab_address" >&2
  exit 1
fi

for host_port in 30080 30081 30082; do
  published_address=$(docker port "$node_name" "$host_port/tcp")
  if [ "$published_address" != "127.0.0.1:$host_port" ]; then
    echo "port $host_port is not limited to host loopback: $published_address" >&2
    exit 1
  fi
done

pod_pull_policy=$(lab_kubectl --namespace keycloak-lab get pod directory-diagnostic \
  --output jsonpath='{.spec.containers[0].imagePullPolicy}')
if [ "$pod_pull_policy" != Never ]; then
  echo "diagnostic Pod has unexpected imagePullPolicy $pod_pull_policy" >&2
  exit 1
fi

lab_kubectl --namespace keycloak-lab exec directory-diagnostic -- \
  /run/keycloak-lab/diagnostic/verify-from-pod.sh \
  | tee "$verification_directory/pod-directory.txt"

docker exec keycloak-lab-samba /usr/local/bin/verify-directory \
  >"$verification_directory/samba-after-p04.txt"
if ! cmp "$p03_result" "$verification_directory/samba-after-p04.txt"; then
  echo 'Samba domain SID, users, groups, or binds changed since P03' >&2
  exit 1
fi

if [ "$(global_current_context)" != "$original_context" ]; then
  echo 'the host current kubectl context changed during P04' >&2
  exit 1
fi
if [ "$(sha256_file /etc/hosts)" != "$hosts_before" ]; then
  echo '/etc/hosts changed during P04' >&2
  exit 1
fi

if [ "$(uname -s)" = Darwin ]; then
  colima_resources=$(colima list | awk '$1 == "default" {print "cpu=" $4 " memory=" $5 " disk=" $6}')
else
  colima_resources=not-applicable
fi
docker_resources=$(docker info --format 'cpu={{.NCPU}} memory_bytes={{.MemTotal}} runtime_os={{.OperatingSystem}} architecture={{.Architecture}}')

printf 'cluster=%s\ncontext=%s\nnode=%s\nnode_lab_address=%s\nsamba_lab_address=%s\n' \
  "$cluster_name" "$cluster_context" "$node_name" "$node_lab_address" "$samba_lab_address" \
  | tee "$verification_directory/cluster.txt"
printf 'kind=%s\nkubectl=%s\n%s\ncolima=%s\nhost_current_context=%s\nhost_hosts_file=unchanged\n' \
  "$("$kind_binary" version)" \
  "$("$kubectl_binary" version --client --output json | tr -d '\n')" \
  "$docker_resources" "$colima_resources" "$original_context" \
  | tee "$verification_directory/environment.txt"
printf 'diagnostic_image=keycloak-lab-samba:4.19.5-ubuntu24.04\nimage_pull_policy=Never\nexternal_validation_endpoints=none\n' \
  | tee "$verification_directory/offline-boundary.txt"
printf 'samba_volume=keycloak-lab-samba-data\np03_state=unchanged\n' \
  | tee "$verification_directory/persistence.txt"

printf 'P04 kind-to-Samba verification passed; evidence is in %s\n' "$verification_directory"
