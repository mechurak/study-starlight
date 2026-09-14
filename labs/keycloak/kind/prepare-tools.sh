#!/bin/sh
set -eu

script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$script_directory/common.sh"

case "$(uname -s)/$(uname -m)" in
  Darwin/arm64)
    kind_asset=kind-darwin-arm64
    kind_sha256=0c8c7dbe5e23594a198b786c4bc13dacc101fa6196b0cb0b23a1ca44e61f4b4f
    kubectl_platform=darwin/arm64
    kubectl_sha256=b8be50ae0c6665b646fb009f904a52cad30806deee19ab3b4fe5af2d68bd82eb
    ;;
  Darwin/x86_64)
    kind_asset=kind-darwin-amd64
    kind_sha256=5a99f26f57246dc9319dd294803313197a0f34d33c525b3ea8b655db5916ece0
    kubectl_platform=darwin/amd64
    kubectl_sha256=35c964c16432ea65eda6600d6ff4fea040d5eafcb6ad410297ba67d49b618148
    ;;
  Linux/aarch64|Linux/arm64)
    kind_asset=kind-linux-arm64
    kind_sha256=20022bee6cfcd5086cb7234d218e3454e6090022f2a8f55d1fa7fcf42c3867a2
    kubectl_platform=linux/arm64
    kubectl_sha256=cc749967b62f4422260bc9c0aa7a7c55f45175ae38cb8d95767b5d2b7e04c1fd
    ;;
  Linux/x86_64)
    kind_asset=kind-linux-amd64
    kind_sha256=aee6151561422756b764a4ae28e7f44cda5af5a9eead3cc9985112b1de8d8e0d
    kubectl_platform=linux/amd64
    kubectl_sha256=874d5e72dbb819f43cff16bcd1e4f8bac5b7f2361fe1e55049b0a6c676fb0cbf
    ;;
  *)
    echo "P04 supports only amd64/arm64 macOS or Linux; found $(uname -s)/$(uname -m)" >&2
    exit 1
    ;;
esac

mkdir -p "$tool_directory"
chmod 0700 "$state_directory" "$tool_directory"

install_tool() {
  destination=$1
  expected_sha256=$2
  download_url=$3

  if [ -x "$destination" ] && [ "$(sha256_file "$destination")" = "$expected_sha256" ]; then
    return
  fi

  temporary_file=$destination.tmp.$$
  trap 'rm -f "$temporary_file"' EXIT HUP INT TERM
  curl --fail --location --silent --show-error "$download_url" --output "$temporary_file"
  actual_sha256=$(sha256_file "$temporary_file")
  if [ "$actual_sha256" != "$expected_sha256" ]; then
    echo "checksum mismatch for $download_url: $actual_sha256" >&2
    exit 1
  fi
  chmod 0700 "$temporary_file"
  mv "$temporary_file" "$destination"
  trap - EXIT HUP INT TERM
}

install_tool "$kind_binary" "$kind_sha256" \
  "https://kind.sigs.k8s.io/dl/v0.33.0/$kind_asset"
install_tool "$kubectl_binary" "$kubectl_sha256" \
  "https://dl.k8s.io/release/v1.35.8/bin/$kubectl_platform/kubectl"

"$kind_binary" version
"$kubectl_binary" version --client
