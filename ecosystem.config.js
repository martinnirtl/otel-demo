module.exports = {
  apps : [
      {
        name: "backend",
        script: "start.js",
        cwd: "/home/ubuntu/backend/src",
        watch: true,
        env: {
          "NODE_ENV": "production",
          "PORT": 3000,
          "MAIL_SERVICE_BASE_URL": "https://httpbin.org/anything"
        }
      }
  ]
}
