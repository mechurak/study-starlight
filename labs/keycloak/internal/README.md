# Internal lab automation

이 디렉터리는 학습 설정 자체가 아니라 반복 가능한 환경 준비·적용·검증을 구현한다.

- `runtime/`: CA, certificate, secret, lifecycle metadata와 서비스 공통 함수
- `keycloak/`: 공개 `keycloak/*.json`을 Admin REST에 적용하고, secret/서버 ID 주입과 단계 객체 검사를 수행
- `seed/`: 기존 완성 환경과 MFA/Brokering/Service Account 등 선택 실습의 호환 조합
- `verify/`: guided 실제 로그인 검사와 과거 상세 회귀 검사

학습자는 `../README.md`의 `scripts/` 공개 명령을 먼저 사용한다. `internal/verify/verify-p*.sh`는 과거
순차 evidence를 요구할 수 있으며 현재 guided 상태 확인의 정본이 아니다.
