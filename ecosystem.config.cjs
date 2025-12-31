module.exports = {
  apps: [{
    name: 'photo-gallery',
    script: './dist/index.cjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_file: '.env.production',
    error_file: 'logs/error.log',
    out_file: 'logs/output.log',
    time: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0'
    }
  }]
};
