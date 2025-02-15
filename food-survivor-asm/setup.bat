@echo off
echo Setting up development environment...

REM Create tools directory
mkdir tools 2>nul

REM Download NASM if not present
if not exist "tools\nasm.exe" (
    echo Downloading NASM...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.nasm.us/pub/nasm/releasebuilds/2.15.05/win64/nasm-2.15.05-win64.zip' -OutFile 'tools\nasm.zip'}"
    echo Extracting NASM...
    powershell -Command "& {Expand-Archive -Path 'tools\nasm.zip' -DestinationPath 'tools\nasm' -Force}"
    copy "tools\nasm\nasm-2.15.05\nasm.exe" "tools\nasm.exe"
    rmdir /s /q "tools\nasm"
    del "tools\nasm.zip"
)

REM Download and install DOSBox if not present
if not exist "C:\Program Files (x86)\DOSBox-0.74-3\DOSBox.exe" (
    echo Downloading DOSBox...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://sourceforge.net/projects/dosbox/files/dosbox/0.74-3/DOSBox0.74-3-win32-installer.exe/download' -OutFile 'tools\dosbox-setup.exe'}"
    echo Installing DOSBox...
    tools\dosbox-setup.exe /SILENT
    del tools\dosbox-setup.exe
)

REM Update DOSBOX_PATH in compile.bat and run.bat
set DOSBOX_PATH="C:\Program Files (x86)\DOSBox-0.74-3\DOSBox.exe"
if exist %DOSBOX_PATH% (
    echo DOSBox installed successfully!
) else (
    echo DOSBox installation may have failed.
    echo Please install DOSBox manually from https://www.dosbox.com/
    pause
    exit /b 1
)

echo Setup complete!
echo You can now run compile.bat to build the game
pause 