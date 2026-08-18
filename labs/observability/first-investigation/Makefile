SHELL := /bin/sh

CLUSTER := observability-lab
CONTEXT := kind-$(CLUSTER)
NAMESPACE := observability-lab
APP_IMAGE := observability-lab-app:0.1.0
KIND_NODE_IMAGE := kindest/node:v1.35.5@sha256:ce977ae6d65918d0b58a5f8b5e940429c2ce42fa3a5619ec2bbc60b949c0ac95

.PHONY: check-tools up cluster build load deploy wait status scenario port-forward down

check-tools:
	@command -v docker >/dev/null || { echo "docker가 필요합니다."; exit 1; }
	@command -v kind >/dev/null || { echo "kind가 필요합니다."; exit 1; }
	@command -v kubectl >/dev/null || { echo "kubectl이 필요합니다."; exit 1; }
	@docker info >/dev/null 2>&1 || { echo "Docker 런타임이 실행 중이 아닙니다."; exit 1; }
	@memory_bytes=$$(docker info --format '{{.MemTotal}}'); \
		[ "$$memory_bytes" -ge 6442450944 ] || { echo "Docker에 메모리를 6GiB 이상 할당하세요."; exit 1; }

up: check-tools cluster build load deploy wait status

cluster:
	@kind get clusters 2>/dev/null | grep -qx '$(CLUSTER)' || \
		kind create cluster --name '$(CLUSTER)' --image '$(KIND_NODE_IMAGE)'

build:
	docker build -t '$(APP_IMAGE)' app

load:
	kind load docker-image '$(APP_IMAGE)' --name '$(CLUSTER)'

deploy:
	kubectl --context '$(CONTEXT)' apply -f k8s/namespace.yaml
	kubectl --context '$(CONTEXT)' apply -f k8s/lgtm.yaml
	kubectl --context '$(CONTEXT)' apply -f k8s/app.yaml

wait:
	kubectl --context '$(CONTEXT)' -n '$(NAMESPACE)' rollout status deployment/lgtm --timeout=300s
	kubectl --context '$(CONTEXT)' -n '$(NAMESPACE)' rollout status deployment/checkout --timeout=180s

status:
	kubectl --context '$(CONTEXT)' -n '$(NAMESPACE)' get pod,service

scenario:
	kubectl --context '$(CONTEXT)' -n '$(NAMESPACE)' delete job first-incident --ignore-not-found
	kubectl --context '$(CONTEXT)' apply -f k8s/scenario.yaml
	kubectl --context '$(CONTEXT)' -n '$(NAMESPACE)' wait --for=condition=Ready pod -l job-name=first-incident --timeout=60s
	kubectl --context '$(CONTEXT)' -n '$(NAMESPACE)' logs -f job/first-incident
	kubectl --context '$(CONTEXT)' -n '$(NAMESPACE)' wait --for=condition=complete job/first-incident --timeout=180s

port-forward:
	kubectl --context '$(CONTEXT)' -n '$(NAMESPACE)' port-forward service/lgtm 3000:3000

down:
	kind delete cluster --name '$(CLUSTER)'
