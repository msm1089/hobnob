node {
    checkout scm
    docker.image('docker.elastic.co/elasticsearch/elasticsearch-oss:6.6.1').withRun('-e "discovery.type=single-node"') { c ->
        docker.image('node:10.15.3').inside("--link ${c.id}:db") {
            withEnv(['SERVER_HOSTNAME=db',
                     'JENKINS=true',
                     'NODE_ENV=test',
                     'SERVER_PROTOCOL=http',
                     'SERVER_HOSTNAME=localhost',
                     'SERVER_PORT=8888',
                     'ELASTICSEARCH_PROTOCOL=http',
                     'ELASTICSEARCH_HOSTNAME=localhost',
                     'ELASTICSEARCH_PORT=9200',
                     'ELASTICSEARCH_INDEX=test',
                     'PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIJRQIBADANBgkqhkiG9w0BAQEFAASCCS8wggkrAgEAAoICAQDZC+RZ5kGJtN9W\nRBTrrsO/FQ4Zj39oAkRfVbSJd40XPis  +pvxuwHghR7vM2ylNR1FV3r5RQXLHokhR\n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\n67zXmVHAunbTrDrm0g6d6M/eb/HUqYmhNw==\n-----END PRIVATE KEY-----',
                     'PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA2QvkWeZBibTfVkQU667D\nvxUOGY9/aAJEX1W0iXeNFz4rPqb8bsB4IUe7zNspTUdRVd6+UUFyx6JIUcROYZV7\nBo46j42k3eZs8/JHDeAywxFYUalg+Nq4S4eW0FSSVfZJ4kwdVsKEx9f+w2GSVRLy\n2nEnSysUMmWLkWn5i6Ly0T7O8jGgqHtg/9xgYGLL3nTdxODIvtRiuf0jtZfOJXQX\n4UsVO6jGK1vDMuFcQlatowEWaDDlcr6A4qI/MJBX7ht8xJAEWO+ZIu+g7FYlqdo2\n20FR+x8cn5NX60rLGJE65fU7nh8ybg5yifF4+m3xXrksVQEy49ccOjXKc1oRsQaJ\nLFM2yuHvElR64OMYsYQ/4vWVkUeFT+SsyD/rfK3a6yPOAfdmGO31Uqsmx6X7wU3n\n42jqmOfTduu4RTdYZFs7xEluCjTsvlw/w7mq5ZXl/fwBdPCs6Rqm2tPbipT7AK9P\npuYNv7Lq5BqvAigBaXAMgWx5Q7dfLJ/zfQdfEYnZX35i0GwW4jzDVfVRq0VvDfma\nYfVNRh/wDlCxvDIYCLCIHQ4fbUQpzoDbbO/ho32FRFcSCb0bp9S4CJdhLzdHacul\nSWF76Q33DKg4xXY2sOQgV0AKvXrklnfEaTM2lL1jtuyR6gbfphf3wzPtyia3RdMS\nzk24/AYh0z3Ta5TeUEI1rwsCAwEAAQ==\n-----END PUBLIC KEY-----']) {
              stage('Installing Node Packages') {
                sh 'yarn'
              }
              stage('Waiting') {
                sh 'until curl --silent $DB_PORT_9200_TCP_ADDR:$ELASTICSEARCH_PORT -w "" -o /dev/null; do sleep 1; done'
              }
              stage('Unit Tests') {
                sh 'ELASTICSEARCH_HOSTNAME=$DB_PORT_9200_TCP_ADDR npm run test:unit'
              }
              stage('Integration Tests') {
                sh 'ELASTICSEARCH_HOSTNAME=$DB_PORT_9200_TCP_ADDR npm run test:integration'
              }
              stage('End-to-End (E2E) Tests') {
                sh 'ELASTICSEARCH_HOSTNAME=$DB_PORT_9200_TCP_ADDR npm run test:e2e'
              }
            }
        }
    }
}