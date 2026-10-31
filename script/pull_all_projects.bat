@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: Target workspace folder
set "TARGET_BASE_DIR=%~dp0..\target"
if not "%~1"=="" set "TARGET_BASE_DIR=%~1"

echo ========================================================
echo Pulling latest changes in: %TARGET_BASE_DIR%
echo ========================================================

if not exist "%TARGET_BASE_DIR%" (
    echo Target folder does not exist: %TARGET_BASE_DIR%
    exit /b 1
)

cd /d "%TARGET_BASE_DIR%"

for /d %%D in (*) do (
    echo.
    echo --------------------------------------------------------
    echo Updating repository: %%D
    echo --------------------------------------------------------
    cd "%%D"
    if exist ".git" (
        git pull
    ) else (
        echo Skipping... Not a git repository: %%D
    )
    cd ..
)

echo.
echo All repositories processed successfully.
