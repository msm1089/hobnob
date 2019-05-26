#!/usr/bin/env bash

source <(dotenv-export envs/.env| sed 's/\\n/\n/g')
yarn run docs:update
live-server --port=$SWAGGER_UI_PORT docs/dist/