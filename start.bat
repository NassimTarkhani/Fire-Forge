@echo off
REM Quick start script for Windows

echo ========================================
echo FireForge - Quick Start
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy .env.example to .env
echo 2. Configure your .env file with Supabase and Firecrawl settings
echo 3. Run the database schema in Supabase (schema.sql)
echo 4. Start the server with: uvicorn app.main:app --reload
echo.
echo For more information, see README.md
echo ========================================

pause
