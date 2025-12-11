# $ npx git-rewrite-commits

> AI 기반 Git 커밋 메시지 자동 생성기

![](./git-rewrite-commits.png)

[![npm version](https://img.shields.io/npm/v/git-rewrite-commits.svg)](https://www.npmjs.com/package/git-rewrite-commits)
[![Documentation](https://img.shields.io/badge/docs-live-blue)](https://f.github.io/git-rewrite-commits/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Blog Post](https://img.shields.io/badge/blog-read-orange)](https://blog.fka.dev/blog/2025-11-16-git-rewrite-commits-fix-your-messy-commit-history-with-ai/)

AI를 사용하여 Git 커밋 히스토리 전체를 더 나은 커밋 메시지로 자동 재작성합니다. 오픈소스 공개 전 지저분한 커밋 히스토리를 정리하거나 저장소 유지보수성을 개선하기에 완벽한 도구입니다.

📖 **[블로그 포스트: AI로 지저분한 커밋 히스토리 정리하기](https://blog.fka.dev/blog/2025-11-16-git-rewrite-commits-fix-your-messy-commit-history-with-ai/)**

---

## 빠른 시작 (3단계로 끝!)

### 방법 1: 자동 커밋 메시지 생성 (가장 쉬움)

```bash
# 1. 훅 설치
npx git-rewrite-commits --install-hooks

# 2. 훅 활성화
git config hooks.prepareCommitMsg true

# 3. 이제 그냥 커밋하세요!
git add .
git commit  # AI가 자동으로 커밋 메시지를 생성합니다
```

### 방법 2: 스테이징된 변경사항으로 커밋 메시지 생성

```bash
git add .
npx git-rewrite-commits --staged
# AI가 분석한 커밋 메시지가 출력됩니다
```

### 방법 3: 기존 커밋 히스토리 정리

```bash
# 마지막 5개 커밋 메시지 개선
npx git-rewrite-commits --max-commits 5

# 미리보기만 (변경 없음)
npx git-rewrite-commits --dry-run
```

---

## 코드 변경 분석기

AI가 변경된 코드를 분석하여 다음과 같은 형식으로 정리해줍니다:

```
- 요약: 전체적인 변경 요약
- 주요 변경사항: 핵심 기능 위주 정리
- 파일별 변경사항: 파일 경로와 함께 각 파일의 주요 수정점 나열
```

### 사용법

```bash
# 스테이징된 변경사항 분석
npx git-rewrite-commits --staged --verbose

# 특정 프롬프트로 분석
npx git-rewrite-commits --staged --prompt "변경된 코드에서 핵심적인 기능 추가/변경/삭제 내용을 간결하게 정리해줘"
```

### 프로젝트별 가이드라인 설정

프로젝트 루트에 `COMMIT_MESSAGE.md` 파일을 생성하면 AI가 해당 규칙을 따릅니다:

```markdown
# 커밋 메시지 가이드라인

## 형식
- 요약: 전체적인 변경 요약
- 주요 변경사항: 핵심 기능 위주 정리
- 파일별 변경사항: 파일 경로와 함께 각 파일의 주요 수정점 나열

## 규칙
- 불필요하게 장황한 설명은 피하고, 핵심 위주로 간결하게 서술
- 한국어로 작성
```

---

## Git Push 자동화 워크플로우

git push만 하면 자동으로 커밋 메시지가 생성되고, 확인 요청 후 승인하면 배포되는 흐름을 설정할 수 있습니다.

### 설정 방법

```bash
# 1. 훅 설치
npx git-rewrite-commits --install-hooks

# 2. pre-commit 미리보기 활성화 (커밋 전 AI 메시지 확인)
git config hooks.preCommitPreview true

# 3. prepare-commit-msg 활성화 (자동 메시지 생성)
git config hooks.prepareCommitMsg true

# 4. (선택) 로컬 AI 사용 (데이터가 외부로 전송되지 않음)
git config hooks.commitProvider ollama
ollama pull llama3.2
ollama serve
```

### 워크플로우

```
코드 수정 → git add . → git commit
                            ↓
                   AI가 변경사항 분석
                            ↓
                   커밋 메시지 미리보기
                            ↓
                   승인? (y/n)
                            ↓
                   커밋 완료 → git push
```

### 실제 사용 예시

```bash
# 코드 수정 후
git add .
git commit

# 출력:
# 🤖 AI 생성 커밋 메시지:
# feat(auth): 사용자 인증 로직 개선
#
# - 요약: JWT 토큰 검증 로직 리팩토링
# - 주요 변경사항: 토큰 만료 처리 개선, 에러 핸들링 추가
# - 파일별 변경사항:
#   - src/auth/jwt.ts: 토큰 검증 함수 리팩토링
#   - src/middleware/auth.ts: 에러 핸들링 미들웨어 추가
#
# 이 메시지를 사용하시겠습니까? [Y/n]

# y 입력 후 커밋 완료
git push
```

---

## 주요 기능

- **AI 기반 커밋 메시지 생성** - OpenAI GPT 또는 로컬 Ollama 모델 사용
- **전체 Git 히스토리 재작성** - 더 나은 커밋 메시지로 변환
- **Conventional Commits 형식** - feat, fix, chore 등 표준 형식
- **다국어 지원** - 한국어, 영어, 일본어 등 모든 언어
- **스마트 필터링** - 이미 잘 작성된 커밋은 건너뜀
- **로컬 AI 옵션** - Ollama로 데이터 외부 전송 없이 처리
- **Git 훅 통합** - 매 커밋마다 자동으로 AI 메시지 생성
- **커스텀 템플릿** - 팀별 형식 지원
- **품질 점수** - 개선이 필요한 커밋 식별
- **드라이런 모드** - 적용 전 미리보기
- **커스텀 프롬프트** - `--prompt`로 AI 동작 커스터마이징

---

## 설치

### 설치 없이 바로 사용 (npx)
```bash
npx git-rewrite-commits
# 또는 짧은 버전:
npx grec
```

### 전역 설치
```bash
# 전체 명령어
npm install -g git-rewrite-commits

# 짧은 별칭 (grec = git-rewrite-commits)
npm install -g grec
```

> **모든 플랫폼 지원**: Windows, macOS, Linux

---

## 명령어 옵션

```bash
npx git-rewrite-commits [옵션]

옵션:
  --staged              스테이징된 변경사항으로 커밋 메시지 생성
  --dry-run             미리보기만 (변경 없음)
  --max-commits <n>     마지막 n개 커밋만 처리
  --provider <provider> AI 제공자 (openai 또는 ollama)
  --model <model>       AI 모델 이름
  --template <format>   커스텀 템플릿 형식
  --language <lang>     언어 코드 (ko, en, ja 등)
  --prompt <text>       커스텀 AI 프롬프트
  --verbose             상세 출력
  --install-hooks       Git 훅 설치
  --help                도움말 표시
```

---

## AI 제공자 설정

### OpenAI (원격 API)
```bash
export OPENAI_API_KEY="your-api-key"
npx git-rewrite-commits --provider openai
```

### Ollama (로컬, 추천)
```bash
# Ollama 설치 후
ollama pull llama3.2
ollama serve

# 사용
npx git-rewrite-commits --provider ollama
```

> **보안 팁**: 민감한 저장소에서는 Ollama 사용을 권장합니다. 데이터가 외부로 전송되지 않습니다.

---

## 보안 및 개인정보

- **명시적 동의 필요** - 원격 제공자에 데이터 전송 전 확인
- **자동 민감정보 삭제** - API 키, 비밀번호, 개인키 자동 마스킹
- **로컬 처리 옵션** - Ollama로 데이터 외부 전송 없이 처리
- **옵트인 훅** - 모든 훅은 명시적 활성화 필요
- **자동 백업** - 히스토리 재작성 전 자동 백업

---

## 주의사항

> **이 도구는 Git 히스토리를 재작성합니다. 공유 저장소에서는 주의하세요!**

**사용하기 좋은 경우:**
- 공개 전 개인 프로젝트
- 머지 전 기능 브랜치 (팀 동의 하에)
- 푸시 전 로컬 커밋 정리
- 오픈소스 공개 준비

**사용하지 말아야 할 경우:**
- 팀 조율 없이 공유 브랜치에서
- 다른 사람이 이미 pull한 커밋
- 팀 프로젝트의 main/master 브랜치
- 커밋 해시가 참조되는 저장소

---

## 기여하기

기여를 환영합니다! Pull Request를 자유롭게 제출해주세요.

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (conventional commits 사용!)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 열기

---

## 라이선스

MIT License - [LICENSE](LICENSE) 파일 참조

## 버그 리포트

버그 발견 시 [여기](https://github.com/f/git-rewrite-commits/issues)에 이슈를 생성해주세요.

---

**항상 히스토리 재작성 전에 저장소를 백업하세요!** 🔒
