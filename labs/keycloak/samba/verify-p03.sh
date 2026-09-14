#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
lab_directory=$(CDPATH= cd -- "$script_directory/.." && pwd)
state_directory=$lab_directory/.state
verification_directory=$state_directory/verification/p03
compose_command=$script_directory/compose.sh
host_platform=

case $(uname -s) in
  Darwin)
    host_platform=macos-colima
    host_version=$(sw_vers -productVersion)
    if [ "$host_version" != 26.6.2 ]; then
      echo "P03 verification requires the pinned macOS 26.6.2; found $host_version" >&2
      exit 1
    fi
    if ! colima status >/dev/null 2>&1; then
      echo 'P03 verification requires a running Colima profile on macOS' >&2
      exit 1
    fi
    if [ "$(docker context show)" != colima ]; then
      echo "P03 verification requires Docker context colima; found $(docker context show)" >&2
      exit 1
    fi
    colima_version=$(colima version | sed -n 's/^colima version //p' | head -n 1)
    if [ "$colima_version" != 0.10.3 ]; then
      echo "P03 verification requires Colima 0.10.3; found $colima_version" >&2
      exit 1
    fi
    ;;
  Linux)
    host_platform=ubuntu-docker
    if [ ! -r /etc/os-release ]; then
      echo 'P03 verification requires Ubuntu 24.04; /etc/os-release is unavailable' >&2
      exit 1
    fi
    . /etc/os-release
    if [ "${ID:-}" != ubuntu ] || [ "${VERSION_ID:-}" != 24.04 ]; then
      echo "P03 verification requires Ubuntu 24.04; found ${ID:-unknown} ${VERSION_ID:-unknown}" >&2
      exit 1
    fi
    host_version=$VERSION_ID
    ;;
  *)
    echo "P03 verification supports macOS with Colima or Ubuntu 24.04; found $(uname -s)" >&2
    exit 1
    ;;
esac

case $(uname -m) in
  x86_64|arm64|aarch64) ;;
  *)
    echo "P03 verification supports only amd64/arm64; found $(uname -m)" >&2
    exit 1
    ;;
esac

if ! docker info >/dev/null 2>&1; then
  echo 'P03 verification requires a running Docker runtime' >&2
  exit 1
fi

runtime_operating_system=$(docker info --format '{{.OperatingSystem}}')
if [ "$host_platform" = macos-colima ]; then
  case $runtime_operating_system in
    'Ubuntu 24.04'*) ;;
    *)
      echo "P03 verification requires an Ubuntu 24.04 Colima VM; found $runtime_operating_system" >&2
      exit 1
      ;;
  esac
fi

if [ "$host_platform" = ubuntu-docker ] && \
   docker info --format '{{json .SecurityOptions}}' | grep -Fq 'rootless'; then
  echo 'P03 verification does not support rootless Docker' >&2
  exit 1
fi

if ! "$compose_command" version >/dev/null 2>&1; then
  echo 'P03 verification requires Docker Compose 5.5.1' >&2
  exit 1
fi

docker_client_version=$(docker version --format '{{.Client.Version}}')
docker_server_version=$(docker version --format '{{.Server.Version}}')
compose_version=$("$compose_command" version --short)
case $host_platform in
  macos-colima)
    if [ "$docker_client_version" != 29.6.1 ] || [ "$docker_server_version" != 29.5.2 ]; then
      echo "P03 verification requires the pinned Colima Docker client/server 29.6.1/29.5.2; found $docker_client_version/$docker_server_version" >&2
      exit 1
    fi
    ;;
  ubuntu-docker)
    if [ "$docker_client_version" != 29.8.0 ] || [ "$docker_server_version" != 29.8.0 ]; then
      echo "P03 verification requires Docker client/server 29.8.0; found $docker_client_version/$docker_server_version" >&2
      exit 1
    fi
    ;;
esac
if [ "$compose_version" != 5.5.1 ]; then
  echo "P03 verification requires Docker Compose 5.5.1; found $compose_version" >&2
  exit 1
fi

if docker network inspect keycloak-lab >/dev/null 2>&1; then
  network_subnet=$(docker network inspect keycloak-lab --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}')
  network_project=$(docker network inspect keycloak-lab --format '{{if .Labels}}{{index .Labels "com.docker.compose.project"}}{{end}}')
  if [ "$network_subnet" != 172.30.0.0/24 ] || [ "$network_project" != keycloak-lab ]; then
    echo 'existing keycloak-lab network is not the expected Compose-owned 172.30.0.0/24 network' >&2
    exit 1
  fi
else
  if [ "$host_platform" = macos-colima ]; then
    matching_route=$(colima ssh -- ip -o route show match 172.30.0.10 | head -n 1)
  else
    matching_route=$(ip -o route show match 172.30.0.10 | head -n 1)
  fi
  case $matching_route in
    ''|default\ *) ;;
    *)
      echo "172.30.0.0/24 overlaps an existing host route: $matching_route" >&2
      exit 1
      ;;
  esac
fi

if docker volume inspect keycloak-lab-samba-data >/dev/null 2>&1; then
  echo 'P03 provision verification requires the keycloak-lab-samba-data volume to be absent' >&2
  echo 'inspect the existing volume and remove that exact lab volume before retrying' >&2
  exit 1
fi

mkdir -p "$verification_directory"
chmod 0700 "$state_directory" "$state_directory/verification" "$verification_directory"

cd "$lab_directory"
"$script_directory/prepare-state.sh"

"$compose_command" build --pull samba
image_architecture=$(docker image inspect keycloak-lab-samba:4.19.5-ubuntu24.04 \
  --format '{{.Architecture}}')
case $(uname -m) in
  x86_64) expected_image_architecture=amd64 ;;
  arm64|aarch64) expected_image_architecture=arm64 ;;
esac
if [ "$image_architecture" != "$expected_image_architecture" ]; then
  echo "Samba image architecture is $image_architecture; expected $expected_image_architecture" >&2
  exit 1
fi
"$compose_command" up --detach --wait samba
samba_package_version=$("$compose_command" exec -T samba dpkg-query -W -f='${Version}' samba)
if [ "$samba_package_version" != '2:4.19.5+dfsg-4ubuntu9.7' ]; then
  echo "unexpected Samba package version: $samba_package_version" >&2
  exit 1
fi
"$compose_command" exec -T samba /usr/local/bin/verify-directory \
  | tee "$verification_directory/before-recreate.txt"

"$compose_command" exec -T samba /usr/local/bin/seed-directory
"$compose_command" exec -T samba /usr/local/bin/seed-directory
"$compose_command" exec -T samba /usr/local/bin/verify-directory \
  >"$verification_directory/after-seed-rerun.txt"
cmp "$verification_directory/before-recreate.txt" "$verification_directory/after-seed-rerun.txt"

"$compose_command" up --detach --wait --force-recreate samba
"$compose_command" exec -T samba /usr/local/bin/verify-directory \
  | tee "$verification_directory/after-recreate.txt"
cmp "$verification_directory/before-recreate.txt" "$verification_directory/after-recreate.txt"

container_security=$(docker inspect keycloak-lab-samba \
  --format '{{.HostConfig.Privileged}}|{{.HostConfig.NetworkMode}}|{{json .HostConfig.CapAdd}}')
container_mounts=$(docker inspect keycloak-lab-samba \
  --format '{{range .Mounts}}{{println .Source}}{{end}}')
if [ "$container_security" != 'false|keycloak-lab|["CAP_SYS_ADMIN"]' ]; then
  echo "unexpected Samba container security settings: $container_security" >&2
  exit 1
fi
if printf '%s\n' "$container_mounts" | grep -Eq '/(var/)?run/docker\.sock$'; then
  echo 'Samba container unexpectedly mounts the Docker socket' >&2
  exit 1
fi
printf 'privileged=false\nnetwork_mode=keycloak-lab\ncap_add=SYS_ADMIN\ndocker_socket_mount=false\n' \
  | tee "$verification_directory/container-security.txt"
printf 'host_platform=%s\nhost_version=%s\nruntime_os=%s\narchitecture=%s\ndocker_client=%s\ndocker_server=%s\ncompose=%s\nimage_architecture=%s\nsamba_package=%s\n' \
  "$host_platform" "$host_version" "$runtime_operating_system" "$(uname -m)" "$docker_client_version" "$docker_server_version" \
  "$compose_version" "$image_architecture" "$samba_package_version" \
  | tee "$verification_directory/environment.txt"

printf 'P03 Samba verification passed; evidence is in %s\n' "$verification_directory"
