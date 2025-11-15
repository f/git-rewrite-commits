@echo off
REM Pre-commit hook for git-rewrite-commits (Windows)
REM This hook runs before a commit to optionally preview the AI-generated message
REM
REM Installation:
REM   copy hooks\pre-commit.bat .git\hooks\pre-commit
REM   git config hooks.preCommitPreview true
REM
REM Configuration:
REM   git config hooks.preCommitPreview true/false    - Enable/disable preview
REM   git config hooks.commitProvider ollama/openai   - Set AI provider  
REM   git config hooks.commitTemplate "format"         - Set template
REM   git config hooks.commitLanguage "en"             - Set language
REM
REM PRIVACY NOTICE:
REM When enabled, this hook sends your staged changes to an AI provider (OpenAI by default).
REM Use --provider ollama for local processing without remote API calls.

setlocal enabledelayedexpansion

REM Check if preview is enabled (opt-in required for security)
for /f "tokens=*" %%i in ('git config --get --type^=bool hooks.preCommitPreview 2^>nul') do set PREVIEW_ENABLED=%%i

if not "%PREVIEW_ENABLED%"=="true" (
    exit /b 0
)

REM Colors for output (using ANSI escape codes)
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "CYAN=[36m"
set "NC=[0m"

echo %CYAN%🤖 AI Commit Message Preview%NC%
echo %YELLOW%Analyzing staged changes...%NC%
echo.

REM Check for staged changes
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
    echo %YELLOW%No staged changes found.%NC%
    exit /b 0
)

REM Determine AI provider (via environment variable or git config)
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
        echo %RED%Error: OPENAI_API_KEY not set%NC%
        echo %YELLOW%Set it with: set OPENAI_API_KEY="your-api-key"%NC%
        echo %YELLOW%Or use Ollama: git config hooks.commitProvider ollama%NC%
        exit /b 0
    )
)

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
if "%LANGUAGE%"=="" set "LANGUAGE=en"
set CMD=%CMD% --language %LANGUAGE%

echo %BLUE%Suggested commit message:%NC%
echo ----------------------------------------

REM Generate and display the message
for /f "delims=" %%i in ('%CMD% 2^>nul') do set "MESSAGE=%%i"

if not "%MESSAGE%"=="" (
    echo %GREEN%%MESSAGE%%NC%
    echo ----------------------------------------
    echo.
    echo %CYAN%This message will be used when you complete the commit.%NC%
    echo %YELLOW%You can edit it in the commit editor if needed.%NC%
    echo.
    
    REM Save the generated message for prepare-commit-msg to use
    REM This prevents regenerating a different message
    if not defined GIT_DIR set GIT_DIR=.git
    echo %MESSAGE%> "%GIT_DIR%\.ai-commit-message.tmp"
    
    REM Ask user if they want to continue
    set /p "answer=Continue with commit? (y/n) "
    
    if /i not "!answer!"=="y" (
        echo %RED%Commit cancelled.%NC%
        REM Clean up temp file on cancel
        del /f /q "%GIT_DIR%\.ai-commit-message.tmp" 2>nul
        exit /b 1
    )
) else (
    echo %RED%Failed to generate preview. Continuing anyway...%NC%
)

exit /b 0
