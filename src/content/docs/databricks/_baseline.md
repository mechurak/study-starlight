# Databricks on AWS 덱의 기준

`databricks` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱이 답할 질문

이 덱은 "사내 데이터를 AWS Databricks로 분석하려면 어디에 무엇을 두어야 하는가"를
도입 검토자와 플랫폼 엔지니어의 눈높이에서 설명한다. 제품 기능 목록보다 데이터의 위치,
네트워크 경로, 권한 경계를 먼저 그린다.

특히 사용자가 말한 `CX망`은 **통신사·코로케이션의 Cloud Exchange를 거쳐 AWS Direct Connect로
연결되는 사내 전용망**으로 가정한다. 회사에서 CX를 다른 뜻으로 쓰면 실제 회선 구성에 맞게
2장의 용어와 경로를 다시 확인해야 한다.

## 기준 아키텍처

- AWS 리전은 서울(`ap-northeast-2`)을 예시로 하되 리전 고유 endpoint ID는 본문에 고정하지 않는다.
- 민감한 사내 데이터와 온프렘 DB를 다루는 첫 배치는 **classic compute + customer-managed VPC**를
  기준으로 한다.
- 사내망과 AWS는 CX/DX, Direct Connect gateway, Transit Gateway를 거쳐 연결한다고 가정한다.
- 분석용 원본·정제 데이터는 회사 AWS 계정의 S3에 두고 Delta table로 관리한다.
- 데이터 권한·감사·lineage의 기준점은 Unity Catalog다.
- 인터넷 없는 구성이 필요하면 front-end·classic back-end PrivateLink와 AWS service endpoint를
  함께 설계한다.
- serverless는 배제하지 않는다. 다만 compute가 Databricks 관리 영역에 있으므로 우리 VPC의
  DX route를 자동으로 상속하지 않는다는 차이를 먼저 설명한다.

## 서술 규칙

- VPC를 저장소라고 쓰지 않는다. **VPC는 네트워크 경계**, S3·RDS·온프렘 DB가 데이터 위치다.
- "데이터를 Databricks에 올린다"는 표현 뒤에는 실제 저장 위치가 회사 S3인지 외부 source인지 적는다.
- control plane, classic compute plane, serverless compute plane을 섞지 않는다.
- `PrivateLink`는 user → workspace, classic compute → control plane, serverless → customer resource의
  세 방향 중 어느 것인지 붙여 쓴다.
- 전용회선은 암호화를 자동 제공한다고 단정하지 않는다. 기밀성 요구가 있으면 MACsec 또는 VPN/TLS를
  별도로 검토한다고 적는다.
- network reachability와 data authorization을 구분한다. route가 열려도 IAM·Unity Catalog 권한이
  없으면 데이터를 읽지 못해야 한다.
- 기능 이름이 빨리 바뀌는 ingestion·AI 영역은 안정적인 역할을 먼저 설명하고 현재 제품명을 괄호에 둔다.

## 범위 경계

- **다룬다:** account/workspace/Unity Catalog, classic·serverless compute, CX/DX와 VPC,
  S3·Delta Lake, batch·stream ingestion, SQL·ML/AI, 보안·운영·비용, PoC 순서.
- **깊게 다루지 않는다:** Terraform 전체 코드, 세부 subnet CIDR 산정, 방화벽 제품별 rule,
  Spark 튜닝, 업종별 개인정보 규제 해석, Databricks 계약·가격표.

## 기준 시점과 공식 근거

**2026년 8월 18일** 기준으로 아래 공식 문서를 확인했다. 네트워크와 serverless 지원 범위는
빠르게 변하므로 실제 구축 전 다시 확인한다.

| 판단 | 확인한 내용 | 공식 출처 |
|---|---|---|
| plane 경계 | classic compute는 고객 AWS 계정, serverless compute는 Databricks account에서 실행 | Databricks High-level architecture |
| customer-managed VPC | classic workspace를 고객 VPC에 만들고 VPC·subnet·security group을 등록 | Databricks Configure a customer-managed VPC |
| private 연결 | inbound, classic back-end, serverless outbound PrivateLink는 서로 다른 경로 | Databricks PrivateLink concepts |
| S3 권한 | storage credential의 IAM role과 external location의 S3 path를 함께 사용 | Databricks Connect to an AWS S3 external location |
| 데이터 소유 | managed·external asset 모두 underlying data는 고객 cloud account에 있고 소유권은 고객에게 있음 | Databricks Managed versus external assets |
| DX 경로 | private VIF는 private IP로 VPC에 접근하고 DX gateway는 VGW·TGW와 연결 가능 | AWS Direct Connect User Guide |

