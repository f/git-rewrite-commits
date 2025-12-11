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

## 중요 주의사항

> **이 도구는 Git 히스토리를 재작성합니다. 공유 저장소에서는 일반적으로 권장되지 않습니다!**
>
> **사용하기 좋은 경우:**
> - 공개 전 개인 프로젝트
> - 머지 전 기능 브랜치 (팀 동의 하에)
> - 푸시 전 로컬 커밋 정리
> - 오픈소스 공개 준비
>
> **사용하지 말아야 할 경우:**
> - 팀 조율 없이 공유 브랜치에서
> - 다른 사람이 이미 pull한 커밋
> - 팀 프로젝트의 main/master 브랜치
> - 커밋 해시가 참조되는 저장소
>
> **기억하세요:** 히스토리 재작성은 커밋 해시를 변경하며 force-push가 필요합니다. 팀 워크플로우에 지장을 줄 수 있습니다.

---

## 보안 및 개인정보

🔒 **중요 개인정보 안내**: 원격 AI 제공자(OpenAI)를 사용할 때, 이 도구는 파일 목록과 diff를 외부 API로 전송합니다.

**보안 기능:**
- ✅ **명시적 동의 필요** - 원격 제공자에 데이터 전송 전 확인
- ✅ **자동 민감정보 삭제** - API 키, 비밀번호, 개인키 자동 마스킹
- ✅ **로컬 처리 옵션** - Ollama로 데이터 외부 전송 없이 처리
- ✅ **옵트인 훅** - 모든 훅은 git config로 명시적 활성화 필요
- ✅ **안전한 인자 처리** - 쉘 인젝션 공격 방지
- ✅ **자동 백업** - 히스토리 재작성 전 항상 백업 생성

**민감한 저장소에 권장:**
```bash
# 원격 API 대신 로컬 Ollama 사용
git config hooks.commitProvider ollama
git config hooks.providerModel gemma3

ollama pull gemma3
ollama serve
```

> 📖 완전한 보안 문서는 [SECURITY.md](SECURITY.md) 참조

---

## 주요 기능

- **AI 기반 커밋 메시지 생성** - OpenAI GPT 또는 로컬 Ollama 모델 사용
- **전체 Git 히스토리 재작성** - 더 나은 커밋 메시지로 변환
- **Conventional Commits 형식** - feat, fix, chore 등 표준 형식
- **다국어 지원** - 한국어, 영어, 일본어 등 모든 언어로 커밋 생성
- **스마트 필터링** - 이미 잘 작성된 커밋은 건너뜀
- **로컬 AI 옵션** - Ollama로 데이터 외부 전송 없이 처리
- **Git 훅 통합** - 매 커밋마다 자동으로 AI 메시지 생성
- **지능적 분석** - 코드 변경 분석으로 의미있는 메시지 생성
- **배치 처리** - 속도 제한이 있는 일괄 처리
- **안전한 작동** - 자동 백업 브랜치 생성
- **커스텀 템플릿** - 팀별 형식 지원
- **품질 점수** - 개선이 필요한 커밋 식별
- **상세 모드** - diff 미리보기 및 상세 처리 정보
- **커스텀 프롬프트** - `--prompt`로 AI 동작 커스터마이징
- **효율적 처리** - `--max-commits`로 마지막 N개 커밋만 처리
- **드라이런 모드** - 적용 전 미리보기
- **진행 상황 추적** - 색상 출력으로 실시간 진행 표시
- **커스텀 컨텍스트** - `COMMIT_MESSAGE.md` 파일로 프로젝트별 가이드라인

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

# 또는 짧은 별칭 설치 (grec = git-rewrite-commits)
npm install -g grec

# 둘 다 동일하게 작동:
git-rewrite-commits --help
grec --help  # 같은 기능, 더 짧은 이름!
```

> ✅ **모든 플랫폼 지원**: Windows, macOS, Linux
> 💡 **팁**: `grec`은 `git-rewrite-commits`의 짧은 별칭입니다 - 편한 것을 사용하세요!

---

## 빠른 훅 설치

**1단계: AI 커밋 메시지 훅 설치 또는 업데이트**

```bash
npx git-rewrite-commits --install-hooks
# 또는 짧은 별칭:
npx grec --install-hooks
```

> 💡 **기존 훅 업데이트**: 훅이 이미 있으면 최신 버전으로 업데이트됩니다. git-rewrite-commits가 아닌 훅은 교체 전에 백업됩니다.

**2단계: 원하는 훅 활성화 (보안을 위해 옵트인 필요):**

```bash
# 옵션 A: 커밋 전 메시지 미리보기 활성화
git config hooks.preCommitPreview true

# 옵션 B: 자동 메시지 생성 활성화
git config hooks.prepareCommitMsg true

# 또는 둘 다 활성화하여 완전한 경험!

# 개인정보 보호: 원격 OpenAI 대신 로컬 Ollama 사용
git config hooks.commitProvider ollama
git config hooks.providerModel llama3.2  # 선택: 모델 지정
```

**3단계: AI 제공자 설정:**

```bash
# 옵션 A: OpenAI (원격 API로 데이터 전송)
export OPENAI_API_KEY="your-api-key"  # Unix/macOS
# set OPENAI_API_KEY="your-api-key"    # Windows

# 옵션 B: Ollama (로컬 처리, 민감한 저장소에 권장)
ollama pull llama3.2
ollama serve

# 옵션 C: 커스텀 서버/포트의 Ollama
export OLLAMA_URL="http://192.168.1.100:11434"  # Unix/macOS
# set OLLAMA_URL=http://192.168.1.100:11434     # Windows
```

> **상세 설정 가이드는 [QUICK_START.md](QUICK_START.md) 참조**

### 추가 설정 (선택)

```bash
# 템플릿 형식 설정
git config hooks.commitTemplate "[JIRA-XXX] feat: message"

# 언어 설정
git config hooks.commitLanguage "ko"  # 한국어, 영어 등

# 특정 모델 설정
git config hooks.providerModel "gpt-4"  # 또는 "gpt-3.5-turbo", "llama3.2" 등

# 커스텀 Ollama 서버 URL 설정 (localhost:11434가 아닌 경우)
git config hooks.ollamaUrl "http://192.168.1.100:11434"
```

### `COMMIT_MESSAGE.md`로 프로젝트별 가이드라인

`COMMIT_MESSAGE.md` 파일을 생성하면 AI가 따를 프로젝트별 커밋 메시지 가이드라인을 제공할 수 있습니다. 도구는 다음 위치에서 이 파일을 순서대로 검색합니다:

1. **프로젝트 루트** - `./COMMIT_MESSAGE.md`
2. **Git 디렉토리** - `./.git/COMMIT_MESSAGE.md`
3. **GitHub 디렉토리** - `./.github/COMMIT_MESSAGE.md`

예시 `COMMIT_MESSAGE.md`:
```markdown
# 프로젝트 커밋 가이드라인

## 요구사항
- 다음 스코프로 conventional commits 사용: auth, api, ui, db
- 가능하면 티켓 번호 포함 (예: JIRA-123)
- 보안 변경은 명확히 표시
- Breaking change는 메시지에 BREAKING CHANGE 포함

## 프로젝트 컨텍스트
이것은 민감한 데이터를 다루는 금융 서비스 API입니다.
커밋 메시지에서 보안, 규정 준수, 성능을 강조하세요.
```

완전한 예시는 이 저장소의 [`COMMIT_MESSAGE.md.example`](COMMIT_MESSAGE.md.example) 참조.

---

## 사용법

### 명령어 예시

```bash
# 전체 명령어 사용
npx git-rewrite-commits [옵션]

# 또는 짧은 별칭 (grec) 사용
npx grec [옵션]
```

일반적인 사용 사례:

```bash
# 전체 Git 히스토리 재작성
npx git-rewrite-commits

# 적용 없이 미리보기 (드라이런)
npx git-rewrite-commits --dry-run

# 스테이징된 변경사항으로 커밋 메시지 생성
npx git-rewrite-commits --staged

# 마지막 10개 커밋만 처리
npx git-rewrite-commits --max-commits 10

# 커스텀 AI 모델 사용
npx git-rewrite-commits --model gpt-4

# Ollama로 로컬 AI 사용
npx git-rewrite-commits --provider ollama

# Git 훅 설치/업데이트
npx git-rewrite-commits --install-hooks
```

---

## 실제 예시

### 자동 커밋 메시지 생성

**두 가지 스마트 훅**:
1. **pre-commit**: AI 메시지 미리보기 및 선택적으로 나쁜 커밋 메시지 교체
2. **prepare-commit-msg**: 자동으로 생성하거나 승인된 메시지 사용

```bash
# 훅 설치 (두 명령어 모두 사용 가능)
npx git-rewrite-commits --install-hooks
# 또는
npx grec --install-hooks

# 활성화 (보안을 위해 옵트인)
git config hooks.preCommitPreview true    # 커밋 전 미리보기
git config hooks.prepareCommitMsg true    # 에디터에서 자동 생성

# 제공자 설정
git config hooks.commitProvider ollama  # 또는 OPENAI_API_KEY로 OpenAI 사용
git config hooks.providerModel llama3.2  # 선택: 모델 지정
```

이제 `git commit` 실행 시:
- pre-commit 사용: AI 메시지 미리보기가 먼저 표시됨
- prepare-commit-msg 사용: AI 메시지가 에디터에 나타남

### 기존 커밋 수동 재작성

```bash
# 푸시 전 마지막 5개 커밋 정리
echo "🔧 푸시 전 커밋 메시지 개선 중..."
npx git-rewrite-commits --max-commits 5 --dry-run

echo "변경사항을 적용하시겠습니까? (y/n)"
read answer
if [ "$answer" = "y" ]; then
    npx git-rewrite-commits --max-commits 5
fi
```

### 빠른 수정을 위한 별칭

`~/.gitconfig` 또는 `~/.zshrc`/`~/.bashrc`에 추가:

```bash
# Git 별칭
git config --global alias.fix-commits '!npx git-rewrite-commits --max-commits'

# 사용법: git fix-commits 3
```

```bash
# 쉘 별칭
alias fix-last-commit='npx git-rewrite-commits --max-commits 1 --skip-backup'
alias fix-branch='npx git-rewrite-commits --max-commits 20'

# 사용법: fix-last-commit
```

### 팀 워크플로우: 기능 브랜치 정리

Pull Request 생성 전:

```bash
# 1. 수정이 필요한 것 확인
npx git-rewrite-commits --dry-run --max-commits 10

# 2. 개선사항 적용
npx git-rewrite-commits --max-commits 10

# 3. 기능 브랜치에 force push
git push --force-with-lease origin feature-branch
```

### CI/CD 통합

CI 파이프라인(예: GitHub Actions)에 PR 검증 추가:

```yaml
- name: 커밋 품질 확인
  run: |
    npx git-rewrite-commits --dry-run --max-commits ${{ github.event.pull_request.commits }}
    # 어떤 커밋이 개선될지 표시됩니다
```

### 오픈소스 공개 준비

비공개 저장소를 공개하기 전:

```bash
# 커스텀 템플릿으로 모든 커밋 수정
npx git-rewrite-commits \
  --template "feat(scope): message" \
  --language ko \
  --no-skip-well-formed

# 변경사항 검토
git log --oneline -20

# 만족하면 force push
git push --force-with-lease origin main
```

---

## 작동 방식

1. **분석**: 스테이징된 변경사항 또는 커밋 히스토리 읽기
2. **생성**: AI를 사용하여 의미있는 conventional 커밋 메시지 생성
3. **적용**: 더 나은 메시지로 커밋 업데이트

### 스마트 메시지 교체
`git commit -m "나쁜 메시지"`를 사용할 때 pre-commit이:
- 더 나은 AI 생성 메시지 제안
- 승인 시 **나쁜 메시지를 교체**
- 커밋 에디터에서 교체된 내용 표시

### 히스토리 재작성 프로세스
1. **백업 생성**: 현재 브랜치 상태 저장
2. **히스토리 재작성**: `git filter-branch`로 새 메시지 적용
3. **복구 제공**: 필요시 복원을 위한 백업 브랜치 유지

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
  --quiet               모든 출력 숨기기
  --no-skip-well-formed 모든 커밋 처리
  --min-quality-score   품질 임계값 (1-10)
  --skip-backup         백업 브랜치 생성 안 함
  --skip-remote-consent 원격 API 동의 프롬프트 건너뛰기
  --install-hooks       Git 훅 설치
  --help                도움말 표시
```

---

## 기여하기

기여를 환영합니다! Pull Request를 자유롭게 제출해주세요. 큰 변경의 경우, 먼저 이슈를 열어 변경하고 싶은 내용을 논의해주세요.

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (conventional commits 사용!)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 열기

---

## 라이선스

이 프로젝트는 MIT 라이선스로 배포됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일 참조.

## 버그 리포트

버그 발견 시 [여기](https://github.com/f/git-rewrite-commits/issues)에 이슈를 생성해주세요.

## 문의

질문과 지원은 GitHub 저장소에 이슈를 열어주세요.

---

**항상 히스토리 재작성 전에 저장소를 백업하세요!** 🔒
