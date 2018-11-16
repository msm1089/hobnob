#!/usr/bin/env bash
RETRY_INTERVAL=${RETRY_INTERVAL:-0.2}
echo Setting up environment for end-to-end tests...
echo Checking elasticsearch service is running...
yarn run es-init > /dev/null
echo Checking test server is running...
if ! netstat -aon | grep "0.0.0.0:$SERVER_PORT" | grep "LISTENING"; then
  pm2 -s start ./scripts/serve.js
  until netstat -aon | grep "0.0.0.0:$SERVER_PORT" | grep "LISTENING"; do
    sleep $RETRY_INTERVAL
  done
fi > /dev/null
echo Running tests...
npx cucumber-js spec/cucumber/features --require-module @babel/register --require spec/cucumber/steps