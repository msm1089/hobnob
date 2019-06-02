#!/usr/bin/env bash
set -e
RETRY_INTERVAL=${RETRY_INTERVAL:-0.2}

# Run our API server as a background process
if [[ "$OSTYPE" == "msys" ]]; then
        if ! netstat -aon | grep "0.0.0.0:$SERVER_PORT" | grep "LISTENING"; then
                npx pm2 start --no-autorestart --name test:serve "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" -- run test:serve
                until netstat -aon | grep "0.0.0.0:$SERVER_PORT" | grep "LISTENING"; do
                sleep $RETRY_INTERVAL
                done
        fi
else
        if ! ss -lnt | grep -q :$SERVER_PORT; then
                yarn run test:serve &
        fi
        until ss -lnt | grep -q :$SERVER_PORT; do
          sleep $RETRY_INTERVAL
        done
fi
npx cucumber-js spec/cucumber/features --require-module @babel/register --require spec/cucumber/steps

if [[ "$OSTYPE" == "msys" ]]; then
        npx pm2 delete test:serve
fi
