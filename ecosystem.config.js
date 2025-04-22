module.exports = {
  apps: [
    {
      name: 'gotpage',
      script: 'npm',
      args: 'run start -- -p 4001',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
        // Dodaj inne zmienne środowiskowe
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
    },
  ],
};
