@echo off
echo Creating directory structure...

:: Create main directories
mkdir assets 2>nul
mkdir assets\fonts 2>nul
mkdir assets\sounds 2>nul
mkdir assets\textures 2>nul

:: Create placeholder sound files
echo Creating placeholder sound files...
copy nul "assets\sounds\hit.wav" >nul 2>&1
copy nul "assets\sounds\shoot.wav" >nul 2>&1
copy nul "assets\sounds\levelup.wav" >nul 2>&1
copy nul "assets\sounds\gameover.wav" >nul 2>&1

:: Create README files
echo This directory contains font files > assets\fonts\README.md
echo This directory contains sound files > assets\sounds\README.md
echo This directory contains texture files > assets\textures\README.md

:: Download font if it doesn't exist
if not exist "assets\fonts\pixel.ttf" (
    echo Downloading pixel font...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/google/fonts/raw/main/ofl/pressstart2p/PressStart2P-Regular.ttf' -OutFile 'assets\fonts\pixel.ttf'}"
)

echo Directory structure created!
echo.
echo Please ensure the following files exist:
echo - assets/fonts/pixel.ttf
echo - assets/sounds/hit.wav
echo - assets/sounds/shoot.wav
echo - assets/sounds/levelup.wav
echo - assets/sounds/gameover.wav
echo.
pause 