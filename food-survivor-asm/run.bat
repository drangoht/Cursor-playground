@echo off
REM Check if game.com exists
if not exist game.com (
    echo Game not compiled! Running compile.bat first...
    call compile.bat
    if errorlevel 1 exit /b 1
)

REM Check for DOSBox in multiple locations
set "DOSBOX_PATH="
if exist "C:\Program Files (x86)\DOSBox-0.74-3\DOSBox.exe" (
    set "DOSBOX_PATH=C:\Program Files (x86)\DOSBox-0.74-3\DOSBox.exe"
) else if exist "C:\Program Files\DOSBox-0.74-3\DOSBox.exe" (
    set "DOSBOX_PATH=C:\Program Files\DOSBox-0.74-3\DOSBox.exe"
) else if exist "%PROGRAMFILES%\DOSBox-0.74-3\DOSBox.exe" (
    set "DOSBOX_PATH=%PROGRAMFILES%\DOSBox-0.74-3\DOSBox.exe"
)

if "%DOSBOX_PATH%"=="" (
    echo DOSBox not found! Please run setup.bat first
    pause
    exit /b 1
)

REM Create a temporary DOSBox configuration file
echo [autoexec] > dosbox_conf.txt
echo mount c "%CD%" >> dosbox_conf.txt
echo c: >> dosbox_conf.txt
echo game.com >> dosbox_conf.txt

REM Run DOSBox with our configuration
"%DOSBOX_PATH%" -conf dosbox_conf.txt

REM Clean up
del dosbox_conf.txt 