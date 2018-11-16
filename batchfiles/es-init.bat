@ECHO off
net start | grep "elasticsearch-service-x64"
if %ERRORLEVEL% == 2 goto trouble
if %ERRORLEVEL% == 1 goto stopped
if %ERRORLEVEL% == 0 goto started
echo ES: unknown status - trying to start...
NET START elasticsearch-service-x64
goto wait
:trouble
echo ES: trouble - trying to start...
NET START elasticsearch-service-x64
goto wait
:stopped
echo ES: stopped  - starting service...
NET START elasticsearch-service-x64
goto wait
:started
echo ES: already running
goto end
:wait
ECHO ES: waiting for response...
curl localhost:%ELASTICSEARCH_PORT%/_stats
if %ERRORLEVEL% neq 0 (
  PING -n 1 127.0.0.1
  goto :wait
)
:end