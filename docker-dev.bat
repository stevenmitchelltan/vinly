@echo off
REM Docker development helper script for Vinly (Windows)
REM Makes it easy to start the development environment

echo.
echo 🍷 Vinly Wine Discovery Platform - Docker Development
echo ======================================================
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  No .env file found!
    echo Creating .env from .env.example...
    if exist .env.example (
        copy .env.example .env
        echo ✅ Created .env file
        echo.
        echo ⚠️  IMPORTANT: Edit .env and add your OPENAI_API_KEY
        echo.
    ) else (
        echo ❌ .env.example not found. Please create .env manually.
        exit /b 1
    )
)

REM Check if OPENAI_API_KEY is set
findstr /C:"OPENAI_API_KEY=sk-" .env >nul 2>&1
if errorlevel 1 (
    echo ⚠️  WARNING: OPENAI_API_KEY not configured in .env
    echo Get your API key from: https://platform.openai.com/api-keys
    echo.
)

REM Parse command line arguments
set PROFILE=
if "%1"=="--with-tools" (
    set PROFILE=--profile tools
    echo 🛠️  Starting with database tools ^(Mongo Express^)...
) else (
    echo 💡 Tip: Use --with-tools to start Mongo Express ^(database UI^)
)

echo.
echo 🚀 Starting Docker containers...
echo.

REM Start Docker Compose
docker-compose %PROFILE% up --build

echo.
echo 👋 Shutting down...

