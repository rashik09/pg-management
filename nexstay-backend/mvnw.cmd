@REM Maven Wrapper batch script for Windows
@REM Downloads Maven if not present and runs the build

@echo off
setlocal

set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

set "MAVEN_VERSION=3.9.6"
set "MAVEN_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%"
set "MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip"
set "MAVEN_ZIP=%MAVEN_DIR%\maven.zip"

if not exist "%MAVEN_DIR%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd" (
    echo Downloading Maven %MAVEN_VERSION%...
    mkdir "%MAVEN_DIR%" 2>nul
    powershell -Command "Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%MAVEN_ZIP%' -UseBasicParsing"
    echo Extracting Maven...
    powershell -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_DIR%' -Force"
    del "%MAVEN_ZIP%"
)

set "M2_HOME=%MAVEN_DIR%\apache-maven-%MAVEN_VERSION%"
"%M2_HOME%\bin\mvn.cmd" %*
