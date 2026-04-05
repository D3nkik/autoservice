module.exports = {
  apps: [
    {
      name: 'autoservice-backend',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'autoservice-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'https://24rasp.ru/api',
        NEXT_PUBLIC_BASE_PATH: '/auto',
        NEXT_PUBLIC_SITE_URL: 'https://24rasp.ru/auto',
      },
    },
  ],
};
