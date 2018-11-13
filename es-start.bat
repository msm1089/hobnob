@ECHO OFF
NET START elasticsearch-service-x64 || ECHO "ES already running"