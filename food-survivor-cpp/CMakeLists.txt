cmake_minimum_required(VERSION 3.10)

# Specify the generator
set(CMAKE_GENERATOR "MinGW Makefiles")

# Force MinGW compiler
set(CMAKE_C_COMPILER "D:/msys64/mingw64/bin/gcc.exe")
set(CMAKE_CXX_COMPILER "D:/msys64/mingw64/bin/g++.exe")

project(FoodSurvivor)

# Set C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Output directories
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})

# Set SFML paths explicitly
set(SFML_DIR "D:/msys64/mingw64/lib/cmake/SFML")
set(SFML_ROOT "D:/msys64/mingw64")

# Find SFML
find_package(SFML 2.5 COMPONENTS graphics audio window system REQUIRED)

# Add source files
set(SOURCES
    src/main.cpp
    src/Game.cpp
    src/Player.cpp
    src/Enemy.cpp
    src/Projectile.cpp
    src/ParticleSystem.cpp
    src/UI.cpp
    src/Weapon.cpp
)

# Create executable
add_executable(FoodSurvivor ${SOURCES})

# Include directories
target_include_directories(FoodSurvivor PRIVATE 
    ${CMAKE_SOURCE_DIR}/src
    ${SFML_INCLUDE_DIR}
)

# Link SFML libraries
target_link_libraries(FoodSurvivor
    sfml-graphics
    sfml-audio
    sfml-window
    sfml-system
)

# Copy assets directory if it exists
if(EXISTS "${CMAKE_SOURCE_DIR}/assets")
    file(COPY assets DESTINATION ${CMAKE_BINARY_DIR})
endif()

# Print debug information
message(STATUS "CMAKE_PREFIX_PATH: ${CMAKE_PREFIX_PATH}")
message(STATUS "SFML_INCLUDE_DIR: ${SFML_INCLUDE_DIR}")
message(STATUS "SFML_LIBRARIES: ${SFML_LIBRARIES}")
message(STATUS "CMAKE_C_COMPILER: ${CMAKE_C_COMPILER}")
message(STATUS "CMAKE_CXX_COMPILER: ${CMAKE_CXX_COMPILER}")
message(STATUS "CMAKE_MAKE_PROGRAM: ${CMAKE_MAKE_PROGRAM}") 