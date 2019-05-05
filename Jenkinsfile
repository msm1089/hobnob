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
                     'ELASTICSEARCH_INDEX=test']) {
              stage('Installing Node Packages') {
                sh 'npm install'
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