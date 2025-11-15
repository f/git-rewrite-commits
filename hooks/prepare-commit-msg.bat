@echo off
REM Git prepare-commit-msg hook to suggest better commit messages (Windows)
REM
REM Installation:
REM   1. Copy this file to .git\hooks\prepare-commit-msg
REM   2. Enable it: git config hooks.prepareCommitMsg true
REM
REM This hook will:
REM - Analyze your staged changes (opt-in only)
REM - Generate an AI-powered commit message
REM - Insert it as the default message (you can edit before saving)
REM
REM PRIVACY NOTICE:
REM This hook sends your staged changes to an AI provider (OpenAI by default).
REM Use --provider ollama for local processing without remote API calls.

setlocal enabledelayedexpansion

set "COMMIT_MSG_FILE=%~1"
set "COMMIT_SOURCE=%~2"
set "SHA1=%~3"

REM Skip processing if:
REM 1. It's not a normal commit (merge, squash, template, message, etc.)
REM 2. User provided -m flag (COMMIT_SOURCE = "message")
REM 3. Using commit template (COMMIT_SOURCE = "template")
if not "%COMMIT_SOURCE%"=="" (
    REM Clean up any temp message from pre-commit
    if not defined GIT_DIR set GIT_DIR=.git
    del /f /q "%GIT_DIR%\.ai-commit-message.tmp" 2>nul
    exit /b 0
)

REM Check if prepare-commit-msg is enabled (opt-in required)
for /f "tokens=*" %%i in ('git config --get --type^=bool hooks.prepareCommitMsg 2^>nul') do set ENABLED=%%i

if not "%ENABLED%"=="true" (
    REM Clean up any temp message from pre-commit
    if not defined GIT_DIR set GIT_DIR=.git
    del /f /q "%GIT_DIR%\.ai-commit-message.tmp" 2>nul
    REM Not enabled, add helpful hint
    (
        echo # Tip: Enable AI commit messages with: git config hooks.prepareCommitMsg true
        echo # Or use Ollama locally: git config hooks.commitProvider ollama
        echo # ⚠️  Note: This will send staged changes to an AI provider
        echo.
        type "%COMMIT_MSG_FILE%"
    ) > "%COMMIT_MSG_FILE%.tmp"
    move /y "%COMMIT_MSG_FILE%.tmp" "%COMMIT_MSG_FILE%" >nul
    exit /b 0
)

REM Determine AI provider
set "PROVIDER="
if defined GIT_COMMIT_PROVIDER (
    set "PROVIDER=%GIT_COMMIT_PROVIDER%"
) else (
    for /f "tokens=*" %%i in ('git config --get hooks.commitProvider 2^>nul') do set "PROVIDER=%%i"
)
if "%PROVIDER%"=="" set "PROVIDER=openai"

REM Check if provider is properly configured
if "%PROVIDER%"=="openai" (
    if not defined OPENAI_API_KEY (
        REM Add a helpful comment if API key is not set
        (
            echo # Tip: Set OPENAI_API_KEY to get AI-generated commit messages
            echo # Or use Ollama: git config hooks.commitProvider ollama
            echo.
            type "%COMMIT_MSG_FILE%"
        ) > "%COMMIT_MSG_FILE%.tmp"
        move /y "%COMMIT_MSG_FILE%.tmp" "%COMMIT_MSG_FILE%" >nul
        exit /b 0
    )
)

REM Check if there are staged changes
git diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    REM Check if pre-commit already generated a message
    if not defined GIT_DIR set GIT_DIR=.git
    set "TEMP_MSG_FILE=%GIT_DIR%\.ai-commit-message.tmp"
    
    if exist "%TEMP_MSG_FILE%" (
        REM Use the message from pre-commit hook
        echo ✨ Using AI message from pre-commit preview... >&2
        set /p AI_MESSAGE=<"%TEMP_MSG_FILE%"
        REM Clean up temp file
        del /f /q "%TEMP_MSG_FILE%" 2>nul
        goto write_message
    )
    
    REM Generate AI-powered commit message
    echo 🤖 Generating AI-powered commit message... >&2
    
    REM Build command
    set "CMD=npx git-rewrite-commits --staged --provider %PROVIDER% --skip-remote-consent"
    
    REM Check if globally installed
    where git-rewrite-commits >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set "CMD=git-rewrite-commits --staged --provider %PROVIDER% --skip-remote-consent"
    )
    
    REM Add template if configured
    set "TEMPLATE="
    if defined GIT_COMMIT_TEMPLATE (
        set "TEMPLATE=%GIT_COMMIT_TEMPLATE%"
    ) else (
        for /f "tokens=*" %%i in ('git config --get hooks.commitTemplate 2^>nul') do set "TEMPLATE=%%i"
    )
    if not "%TEMPLATE%"=="" (
        set CMD=%CMD% --template "%TEMPLATE%"
    )
    
    REM Add language if configured
    set "LANGUAGE="
    if defined GIT_COMMIT_LANGUAGE (
        set "LANGUAGE=%GIT_COMMIT_LANGUAGE%"
    ) else (
        for /f "tokens=*" %%i in ('git config --get hooks.commitLanguage 2^>nul') do set "LANGUAGE=%%i"
    )
    if not "%LANGUAGE%"=="" (
        set CMD=%CMD% --language %LANGUAGE%
    )
    
    REM Generate the message
    set "AI_MESSAGE="
    for /f "delims=" %%i in ('%CMD% 2^>nul') do set "AI_MESSAGE=%%i"
    
    :write_message
    if not "!AI_MESSAGE!"=="" (
        REM Success! Use the AI-generated message
        (
            echo !AI_MESSAGE!
            echo.
            echo # ✨ AI-generated commit message above
            echo # Feel free to edit as needed before saving
            echo #
            echo # Files being committed:
            git diff --cached --name-status | findstr /r "^" | findstr /b /v "^#" | for /f "tokens=*" %%a in ('more') do @echo # %%a
        ) > "%COMMIT_MSG_FILE%"
    ) else (
        REM Fallback if generation fails
        (
            echo # 💡 Tip: AI message generation failed. Writing your own message.
            echo #
            echo # Consider using conventional commit format:
            echo #   feat: add new feature
            echo #   fix: fix a bug
            echo #   docs: documentation changes
            echo #   style: formatting changes
            echo #   refactor: code restructuring
            echo #   test: add or update tests
            echo #   chore: maintenance tasks
            echo #
            echo # Files being committed:
            git diff --cached --name-status | findstr /r "^" | findstr /b /v "^#" | for /f "tokens=*" %%a in ('more') do @echo # %%a
            echo.
            type "%COMMIT_MSG_FILE%"
        ) > "%COMMIT_MSG_FILE%.tmp"
        move /y "%COMMIT_MSG_FILE%.tmp" "%COMMIT_MSG_FILE%" >nul
    )
)

exit /b 0
