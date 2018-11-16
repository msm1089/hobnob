@ECHO off
ECHO %SERVER_PORT%
//for /f "tokens=5" %%a in ('netstat -aon ^| grep "0.0.0.0:%SERVER_PORT%" ^| grep "LISTENING"') do taskkill /f /pid %%a
for /f "tokens=5" %%a in ('netstat -aon ^| grep "0.0.0.0:%SERVER_PORT%" ^| grep "LISTENING"') do echo %%a