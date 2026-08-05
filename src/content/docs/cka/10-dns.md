---
title: "10. 클러스터 DNS"
description: "이름이 IP가 되는 과정"
---

> 이름이 IP가 되는 과정

## CoreDNS는 어디에 있나

```bash
kubectl get deploy coredns -n kube-system
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl get svc kube-dns -n kube-system
# NAME       TYPE        CLUSTER-IP   PORT(S)
# kube-dns   ClusterIP   10.96.0.10   53/UDP,53/TCP,9153/TCP
```

- CoreDNS는 **평범한 Deployment**다. 보통 2개의 레플리카로 돈다
- 앞에 **`kube-dns`라는 Service**가 있다 (이름이 옛날 그대로다)
- 그 ClusterIP가 **모든 Pod의 네임서버**로 들어간다

:::caution[함정]
**CoreDNS Pod이 죽으면 클러스터 전체의 이름 해석이 죽는다.**
"갑자기 모든 게 안 된다"의 유력 후보. 그런데 **IP로는 전부 정상**이라 헷갈린다.
:::

## 이름 규칙

Service의 정식 이름(FQDN)은 이렇게 생겼다.

`서비스이름.네임스페이스.svc.cluster.local`

| 어디서 부르나 | 쓸 수 있는 이름 |
|---|---|
| 같은 네임스페이스 | `web-svc` |
| 다른 네임스페이스 | `web-svc.prod` |
| 어디서나 (완전한 이름) | `web-svc.prod.svc.cluster.local` |

**headless Service의 Pod별 이름**

`파드이름.서비스이름.네임스페이스.svc.cluster.local`\
예: `db-0.db-headless.default.svc.cluster.local`

:::tip[시험]
"다른 네임스페이스의 서비스에 연결하시오" 문제는
**이름에 네임스페이스를 붙이는 것**이 답인 경우가 많다.
:::

## Pod 안의 resolv.conf

```bash
kubectl exec -it web -- cat /etc/resolv.conf
```

```
nameserver 10.96.0.10
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

- **`nameserver`** — `kube-dns` Service의 ClusterIP
- **`search`** — 짧은 이름을 순서대로 붙여본다.
  `web-svc` → `web-svc.default.svc.cluster.local` → `web-svc.svc.cluster.local` → …
- **`ndots:5`** — 점이 5개 미만인 이름은 **search 도메인을 먼저 시도**한다

:::caution[함정]
`ndots:5` 때문에 `api.example.com`(점 2개)을 조회하면
**search 도메인 3개를 먼저 다 실패한 뒤에야** 진짜 조회를 한다.
외부 도메인 응답이 느린 흔한 원인이다. 끝에 점을 찍으면(`api.example.com.`) 바로 조회한다.
:::

## dnsPolicy와 dnsConfig

```yaml
spec:
  dnsPolicy: ClusterFirst        # 기본
  dnsConfig:
    nameservers: ["8.8.8.8"]
    searches: ["custom.local"]
    options:
      - name: ndots
        value: "2"
```

| dnsPolicy | 동작 |
|---|---|
| `ClusterFirst` | 클러스터 DNS를 먼저. 기본값 |
| `ClusterFirstWithHostNet` | `hostNetwork: true`인 Pod도 클러스터 DNS를 쓰게 한다 |
| `Default` | **노드의 `/etc/resolv.conf`를 그대로** 쓴다 (이름과 달리 기본값이 아니다) |
| `None` | 전부 `dnsConfig`로 직접 지정 |

:::caution[함정]
`hostNetwork: true` Pod은
`dnsPolicy`를 `ClusterFirstWithHostNet`으로 바꾸지 않으면
**클러스터 서비스 이름을 못 찾는다.** 노드의 DNS를 쓰게 되기 때문이다.
:::

## Corefile — CoreDNS 설정

```bash
kubectl get cm coredns -n kube-system -o yaml
kubectl edit cm coredns -n kube-system
```

```
.:53 {
    errors
    health { lameduck 5s }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
        ttl 30
    }
    prometheus :9153
    forward . /etc/resolv.conf { max_concurrent 1000 }   # 외부 질의는 노드 DNS로
    cache 30
    loop
    reload
    loadbalance
}
```

- **`kubernetes` 플러그인**이 Service/Pod 이름을 담당한다
- **`forward`** 가 그 밖의 도메인을 노드의 리졸버로 넘긴다
- `reload` 덕분에 ConfigMap을 고치면 **재시작 없이 반영**된다 (몇십 초)

## 특정 도메인을 다른 곳으로 보내기

```
# Corefile에 스탠자를 추가한다
example.internal:53 {
    errors
    cache 30
    forward . 192.168.10.53
}
```

- 사내 DNS로 특정 존만 보낼 때 쓰는 표준 패턴이다
- `hosts` 플러그인으로 정적 매핑도 가능하다

```
hosts {
    192.168.10.50 legacy.internal
    fallthrough
}
```

수정 후에는 CoreDNS 로그로 문법 오류가 없는지 확인한다.
`kubectl logs -n kube-system -l k8s-app=kube-dns`

## DNS 진단

```bash
# 1) 디버그 Pod에서 조회
kubectl run tmp --image=busybox:1.36 --rm -it --restart=Never -- sh
  nslookup web-svc
  nslookup web-svc.default.svc.cluster.local
  nslookup kubernetes.default
  cat /etc/resolv.conf

# 2) CoreDNS 자체 상태
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=50
kubectl get svc kube-dns -n kube-system
kubectl get endpoints kube-dns -n kube-system     # ★ 비어 있으면 CoreDNS Pod이 없다

# 3) 설정 확인
kubectl get cm coredns -n kube-system -o yaml
```

:::tip[시험]
`nslookup kubernetes.default` 가 성공하면 DNS는 정상이다.
이 이름은 **어느 클러스터에나 항상 존재**하므로 기준점으로 쓰기 좋다.
:::

## DNS 증상별 원인

| 증상 | 원인 후보 |
|---|---|
| **모든** 이름이 안 된다 | CoreDNS Pod 다운, `kube-dns` 엔드포인트 비어 있음 |
| 클러스터 이름만 안 된다 | Corefile의 `kubernetes` 플러그인 이상, `dnsPolicy` 잘못 |
| 외부 도메인만 안 된다 | `forward` 대상(노드 resolv.conf) 문제 |
| 특정 네임스페이스만 안 된다 | 짧은 이름을 썼다 → **FQDN 필요** |
| DNS는 되는데 연결이 안 된다 | Service/엔드포인트 문제 (9장) 또는 **NetworkPolicy** (12장) |
| 간헐적으로 느리다 | `ndots:5`로 인한 불필요한 조회, CoreDNS 레플리카 부족 |

:::caution[함정]
**NetworkPolicy로 egress를 막으면 DNS도 막힌다.**
UDP 53번을 명시적으로 허용하지 않으면 이름 해석부터 실패한다. 12장에서 다룬다.
:::

## 10장 요약

- CoreDNS는 **평범한 Deployment**, 앞의 Service 이름은 여전히 **`kube-dns`**
- 이름 규칙: **`서비스.네임스페이스.svc.cluster.local`**
- Pod의 `/etc/resolv.conf`에 **네임서버 + search 도메인 + `ndots:5`** 가 들어간다
- **`ndots:5`가 외부 도메인 조회를 느리게** 만든다 — 끝에 점을 찍으면 우회
- **`hostNetwork` Pod은 `ClusterFirstWithHostNet`** 이 필요하다
- 설정은 `kube-system`의 **`coredns` ConfigMap(Corefile)**. `reload`로 자동 반영
- 기준점 테스트: **`nslookup kubernetes.default`**
- **egress NetworkPolicy는 DNS(UDP 53)를 반드시 허용**해야 한다
