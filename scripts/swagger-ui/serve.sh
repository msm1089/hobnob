#!/usr/bin/env bash

source <(dotenv-export envs/.env| sed 's/\\n/\n/g')
yarn run docs:update
http-server docs/dist/ -p $SWAGGER_UI_PORT