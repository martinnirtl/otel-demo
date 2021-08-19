module.exports = {
  apps : [
    {
      name: "mail-service",
      script: "start.js",
      cwd: "mail-service/src",
      watch: true,
      env: {
        "NODE_ENV": "production",
        "PORT": 4100,
        "REDIS_HOST": "localhost",
        "REDIS_PORT": 6379,
        "REDIS_DB": 1,
        "TEMPLATE_SERVICE_BASE_URL": "http://172.31.32.248:4200",
        "OTEL_BACKEND_URL": undefined,
        "OTEL_AUTH": undefined,
      }
    },
  ]
}
