#!/usr/bin/env bash

sed -i "s!https://petstore.swagger.io/v2/swagger.json!$SERVER_EXTERNAL_PROTOCOL://$SERVER_EXTERNAL_HOSTNAME/openapi.yaml!g" docs/dist/index.html
sed -i '/<\/style>/i\\n      .topbar { display: none; }' docs/dist/index.html
