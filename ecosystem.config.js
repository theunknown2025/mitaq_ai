module.exports = {
  apps: [
    {
      name: 'mitaq-backend',
      cwd: './backend',
      script: 'server.js',
      env: {
        PORT: 3001,
        NODE_ENV: 'production'
      },
      env_development: {
        PORT: 3001,
        NODE_ENV: 'development'
      },
      env_production: {
        PORT: 3001,
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'mitaq-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      env_development: {
        PORT: 3000,
        NODE_ENV: 'development'
      },
      env_production: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'pi',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'https://github.com/theunknown2025/mitaq_ai.git',
      path: '/var/www/html/mitaq_ai',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build:all && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 