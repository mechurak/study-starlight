# MLflow 덱의 기준

`mlflow` 덱을 고치기 전에 읽는다. 다른 덱에는 해당하지 않는다.

## 이 덱의 한 문장

MLflow는 학습·백테스트 실행 하나를 **run으로 잘라 param·metric·tag·artifact를 한 저장소에 모으고,
나중에 "어떤 조건이 왜 나았는가"를 검색·비교로 되찾게 하는 실험 추적 도구**다.

```text
연구 스크립트 ─ log_params / log_metrics / log_artifacts ─▶ tracking store
                                                            ├─ backend store (sqlite): run·param·metric·tag
                                                            └─ artifact store (파일): 리포트·예측·모델
                                                                        │
                                          mlflow ui · search_runs ◀─────┘
```

## 기준 환경

- 기준 소비자는 로컬 `../sshim-trader` 레포다. 시스템 트레이딩 연구(walk-forward·Optuna 튜닝·백테스트)가
  MLflow의 유일한 사용처이고, 실거래 앱(`python -m sshim_trader`)은 MLflow를 쓰지 않는다.
- 그 레포의 MLflow 진입점은 셋이다 — `scripts/research_nxt_daily.py`(experiment `research/nxt_daily_<target>`),
  `scripts/research_tune.py`(experiment `research/tune_<target>`), `sshim_trader/backtest/__main__.py`(experiment `backtest`).
  모두 `sshim_trader/utils/tracking.py`의 `log_run()` 하나를 거친다.
- backend store는 로컬 sqlite `artifacts/mlflow.db`, artifact store는 로컬 디렉터리 `artifacts/mlruns`다.
  tracking server를 띄우지 않고 client가 sqlite에 직접 붙는다. UI는 `uv run mlflow-ui`로 연다.
- 1인 로컬 환경이다. 인증·멀티테넌시·원격 object storage는 "지금 필요 없는 것"으로 다루고,
  옮겨갈 때의 경로만 마지막 장에서 짚는다.
- MLflow는 dev dependency다. 실거래 런타임에 들어가지 않는다.

## 범위 경계

- 중심은 **MLflow Tracking과 Model Registry**다. 탐색 알고리즘(Optuna TPE), 피처 설계, 평가 지표의
  타당성은 [강화학습 덱](/rl/)과 sshim-trader 레포 문서가 맡는다. 이 덱은 그 결과를 어떻게 기록·비교하는가만 다룬다.
- MLflow 3의 GenAI 쪽 기능(trace, prompt registry, LLM judge, scorer, MCP)은 다루지 않는다.
  LLM 애플리케이션 관측은 [Langfuse 덱](/langfuse/)이 맡는다.
- Databricks 관리형 MLflow, Unity Catalog 모델 등록은 다루지 않는다. 관련 플랫폼 이야기는
  [Databricks 덱](/databricks/)에 있다.
- Kubernetes 배포·object storage·SSO 같은 서버 운영은 이 덱의 기준 환경이 아니다. 마지막 장에서
  "옮겨갈 때 무엇이 바뀌는가"만 한 절로 적고, 실제 구축은 [온프렘 Kubernetes 덱](/onprem/)을 따른다.
- `mlflow.evaluate`·`mlflow deployments`·MLflow Projects는 이 레포가 쓰지 않으므로 이름만 언급한다.

## 기준 시점과 확인한 사실

**2026년 9월 5일** 기준이다. 아래 사실은 공식 문서와 `../sshim-trader`에 설치된 **MLflow 3.15.2**에서
직접 확인했다. API 시그니처를 인용할 때는 기억이 아니라 설치된 버전의 `inspect.signature`로 확인한다.

| 항목 | 확인한 사실 | 확인 방법 |
|---|---|---|
| 버전 | sshim-trader의 dev group에 `mlflow>=3.13`, 실제 설치는 3.15.2다 | `pyproject.toml` · `mlflow.__version__` |
| CLI | `mlflow ui`는 `mlflow server`와 같은 명령이고 설명도 "tracking server (UI + REST API)"다 | `mlflow ui --help` |
| 기본 backend | 인자 없이 서버를 띄우면 `sqlite:///mlflow.db`, 기존 `./mlruns`가 있으면 그쪽으로 되돌아간다 | `mlflow ui --help` |
| file store | file store는 유지보수 모드이고 database store가 기본이다 | Backend Stores |
| 값 한도 | param 값 6000자, key 250자, tag 값 8000자다 | `mlflow.utils.validation` |
| param | param은 immutable이고 값은 문자열로 저장된다 | Tracking API |
| metric | `log_metric(key, value, step=None, timestamp=None, run_id=None, model_id=None, dataset=None)`이다 | `inspect.signature` |
| artifact | `log_artifacts(local_dir, artifact_path=None)`은 **디렉터리 이름이 아니라 내용**을 올린다 | Python API |
| 중첩 run | 자식 run은 `start_run(nested=True)`로 만들고 `mlflow.parentRunId` tag가 붙는다 | Tracking API |
| 검색 | `mlflow.search_runs`의 기본 `output_format`은 `'pandas'`다 | `inspect.signature` |
| 검색 문법 | 필드는 `metrics.`·`params.`·`tags.`·`attributes.`·`datasets.`이고 `AND`만 지원한다 | Search Runs |
| 모델 | MLflow 3는 `LoggedModel`을 1급 개체로 두고 `models:/<model_id>` URI를 쓴다 | MLflow 3 · Tracking |
| log_model | 3.x flavor는 `artifact_path` 대신 `name=`을 받는다 | `inspect.signature(mlflow.lightgbm.log_model)` |
| registry | Model Registry는 database backend가 필요하다 (sqlite도 해당된다) | Backend Stores |
| autolog | 지원 flavor는 sklearn·LightGBM·XGBoost·PyTorch·Keras 등이다 | Autologging |
| system tag | git 레포에서 실행하면 `mlflow.source.git.commit`·`branch`·`repoURL`이 자동으로 붙는다 | sshim-trader의 `artifacts/mlflow.db` |
| gc | `mlflow gc`는 `deleted` 단계의 run을 metadata·artifact째 영구 삭제한다 | `mlflow gc --help` |

## 서술 규칙

- 모든 장은 **이 레포에서 지금 무엇이 아쉬운가 → MLflow의 어떤 개념이 그걸 푸는가 → 어떻게 쓰는가 →
  무엇을 잘못 쓰면 조용히 틀리는가** 순으로 쓴다.
- 코드 예시는 sshim-trader의 실제 함수·파일 이름을 쓴다. 가공의 `train.py`, `iris` 예제를 만들지 않는다.
  다만 인용한 코드는 그 시점의 레포 상태이므로 **개선 제안과 현재 코드를 항상 구분해서 적는다.**
- MLflow는 부가 기능이라는 그 레포의 결정을 존중한다. 파일 산출물이 원본이고 MLflow는 색인·비교 계층이다.
  "MLflow에만 남기면 된다"는 식으로 쓰지 않는다.
- param과 metric의 경계를 흐리지 않는다. **실행 전에 정해지는 값이 param, 실행 결과로 나오는 수치가 metric**이다.
  param은 문자열이라 UI에서 숫자 정렬이 안 되고, metric은 나중에 조건 검색의 좌변이 된다.
- run 하나의 크기를 "한 번의 의사결정 단위"로 잡는다. walk-forward의 fold마다 run을 만들지 않는다.
- MLflow 3 API를 기준으로 쓴다. `log_model(artifact_path=...)`, stage(`Staging`·`Production`) 같은
  2.x 관용구를 새 예시의 출발점으로 쓰지 않고, 필요할 때 "예전 방식"으로만 언급한다.
- 화면 설명에는 공식 문서 스크린샷을 쓰고 `<SourceFigure>`로 출처를 남긴다. 이 레포의 실제 런 화면을
  캡처해 올리지 않는다 — 계좌·전략 수치가 그대로 노출된다.
- 성능 수치·수익률을 예시로 쓸 때는 `artifacts/mlflow.db`의 실제 값을 옮기지 않고 형태만 보여 준다.
