@echo off
setlocal enabledelayedexpansion

echo Checking for MSYS2 installation...

:: Set up MSYS2 paths
set "MSYS2_PATH=D:\msys64"
set "MINGW_PATH=%MSYS2_PATH%\mingw64"

:: Add MinGW to PATH (at the beginning to take precedence)
set "PATH=%MINGW_PATH%\bin;%PATH%"

:: Verify installation
if not exist "%MINGW_PATH%\bin\g++.exe" (
    echo G++ compiler not found!
    echo Please run these commands in MSYS2 MinGW 64-bit terminal:
    echo pacman -Syu
    echo pacman -S mingw-w64-x86_64-gcc
    pause
    exit /b 1
)

:: Create and enter build directory
if not exist "build" mkdir build
cd build

:: Clean any previous build
if exist "CMakeCache.txt" del CMakeCache.txt
if exist "CMakeFiles" rmdir /s /q CMakeFiles

:: Configure with CMake using absolute paths
echo Configuring project with CMake...
cmake -G "MinGW Makefiles" ^
    -DCMAKE_BUILD_TYPE=Debug ^
    -DCMAKE_PREFIX_PATH="%MINGW_PATH%" ^
    -DCMAKE_C_COMPILER="%MINGW_PATH%\bin\gcc.exe" ^
    -DCMAKE_CXX_COMPILER="%MINGW_PATH%\bin\g++.exe" ^
    -DCMAKE_MAKE_PROGRAM="%MINGW_PATH%\bin\mingw32-make.exe" ^
    -DSFML_DIR="%MINGW_PATH%\lib\cmake\SFML" ^
    ..

if %errorlevel% neq 0 (
    echo CMake configuration failed!
    pause
    exit /b 1
)

:: Build the project using full path
echo Building project...
"%MINGW_PATH%\bin\mingw32-make.exe"
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

:: Check if executable was created
if exist "FoodSurvivor.exe" (
    echo Build successful!
    echo Running the game...
    FoodSurvivor.exe
) else (
    echo Build completed but executable not found!
)

cd ..
pause 