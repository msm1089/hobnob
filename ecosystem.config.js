module.exports = {
  apps: [
    {
      name: 'testserver',
      script: './scripts/serve.js',
      exec_mode: 'fork',
      restart_delay: 5000,
      min_uptime: 100,
      env: {
        SERVER_PROTOCOL: 'http',
        SERVER_HOSTNAME: 'localhost',
        SERVER_PORT: '8888',
        ELASTICSEARCH_PROTOCOL: 'http',
        ELASTICSEARCH_HOSTNAME: 'localhost',
        ELASTICSEARCH_INDEX: 'test'
      }
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: '212.83.163.1',
      ref: 'origin/master',
      repo: 'git@github.com:repo.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
