@echo off
REM Vinly Quick Start Script for Windows
REM This script helps you get started with Vinly development quickly

echo.
echo 🍷 Welcome to Vinly Setup
echo =========================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.9 or higher.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i

echo ✅ Python found: %PYTHON_VERSION%
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo    Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo    Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo    Installing Python dependencies...
pip install -q -r requirements.txt

REM Create .env if it doesn't exist
if not exist ".env" (
    echo    Creating .env file...
    copy .env.example .env
    echo    ⚠️  Please edit backend\.env with your credentials!
)

cd ..

REM Setup Frontend
echo.
echo 📦 Setting up Frontend...
cd frontend

REM Install dependencies
echo    Installing Node.js dependencies...
call npm install --silent

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo    Creating .env.local file...
    copy .env.example .env.local
)

cd ..

echo.
echo ✅ Setup Complete!
echo.
echo 📝 Next Steps:
echo    1. Edit backend\.env with your MongoDB URI, OpenAI API key, and Instagram credentials
echo    2. Edit backend\scripts\seed_influencers.py with real Dutch wine influencer handles
echo    3. Run: cd backend ^&^& python scripts\seed_influencers.py
echo.
echo 🚀 To start development servers:
echo.
echo    Backend (in one terminal):
echo    $ cd backend
echo    $ venv\Scripts\activate
echo    $ uvicorn app.main:app --reload
echo.
echo    Frontend (in another terminal):
echo    $ cd frontend
echo    $ npm run dev
echo.
echo    Then visit: http://localhost:5173
echo.
echo 📚 For deployment instructions, see DEPLOYMENT.md
echo.

pause

