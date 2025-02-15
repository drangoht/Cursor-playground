@echo off
REM Check for DOSBox in multiple possible locations
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

REM Check if NASM is present
if not exist "tools\nasm.exe" (
    echo NASM not found! Please run setup.bat first
    pause
    exit /b 1
)

REM Create temporary directory for compilation
if not exist "temp" mkdir temp

REM Compile with NASM
"tools\nasm.exe" -f bin game.asm -o temp\game.com

if errorlevel 1 (
    echo Compilation failed!
    pause
    exit /b 1
)

REM Create a temporary DOSBox configuration file
echo [autoexec] > temp\dosbox_conf.txt
echo mount c "%CD%" >> temp\dosbox_conf.txt
echo c: >> temp\dosbox_conf.txt
echo cd temp >> temp\dosbox_conf.txt
echo game.com >> temp\dosbox_conf.txt
echo exit >> temp\dosbox_conf.txt

REM Run DOSBox with our configuration
"%DOSBOX_PATH%" -conf "temp\dosbox_conf.txt"

REM Clean up temporary files
del /q temp\dosbox_conf.txt
copy /y temp\game.com .
rmdir /s /q temp 