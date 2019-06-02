#!/usr/bin/env bash

# Make sure the port is not already bound
if [[ "$OSTYPE" == "msys" ]]; then
        if netstat -aon | grep "0.0.0.0:$SERVER_PORT" | grep "LISTENING"; then
                npx pm2 delete all
        fi
else
        if ss -lnt | grep -q :$SERVER_PORT; then
                if ss -lnt | grep -q :$SERVER_PORT; then
                        echo "Another process is already listening to port $SERVER_PORT"
                        exit 1;
                fi
        fi
fi

 RETRY_INTERVAL=${RETRY_INTERVAL:-0.2}

if [[ "$OSTYPE" == "msys" ]]; then
        if ! curl $ELASTICSEARCH_HOSTNAME:$ELASTICSEARCH_PORT; then
               echo es not running
               sc start elasticsearch
        fi
else
        if ! systemctl is-active --quiet elasticsearch; then
                sudo systemctl start elasticsearch
                
        fi
fi

# Wait until Elasticsearch is ready to respond
until curl $ELASTICSEARCH_HOSTNAME:$ELASTICSEARCH_PORT; do
        sleep $RETRY_INTERVAL
done

 # Clean the test index (if it exists)
curl -X DELETE "$ELASTICSEARCH_HOSTNAME:$ELASTICSEARCH_PORT/$ELASTICSEARCH_INDEX"