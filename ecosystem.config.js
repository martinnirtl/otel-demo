module.exports = {
  apps : [
      {
        name: "backend",
        script: "index.js",
        cwd: "backend/src",
        watch: true,
        env: {
          "NODE_ENV": "production",
          "PORT": 3000,
          "DB_CONNECTION_URL": "mongodb://backend:swordfish@172.31.36.204:27017/backend",
          "MAIL_SERVICE_BASE_URL": "http://172.31.36.204:4100"
        }
      },
      {
        name: "mail-service",
        script: "index.js",
        cwd: "mail-service/src",
        watch: true,
        env: {
          "NODE_ENV": "production",
          "PORT": 4100,
          "REDIS_HOST": "localhost",
          "REDIS_PORT": 6379,
          "REDIS_DB": 1,
          "TEMPLATE_SERVICE_BASE_URL": "http://172.31.32.248:4200"
        }
      },
      {
        name: "template-service",
        script: "index.js",
        cwd: "template-service/src",
        watch: true,
        env: {
          "NODE_ENV": "production",
          "PORT": 4200,
          "REDIS_HOST": "172.31.36.204",
          "REDIS_PORT": 6379,
          "REDIS_DB": 2
        }
      },
  ]
}
