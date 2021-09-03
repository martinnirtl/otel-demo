const pino = require('pino-http')({
  name: process.env.SERVICE_NAME,
  base: undefined,
  formatters: {
    level(label, _number) {
      return { level: label };
    },
  },
  level: process.env.LOG_LEVEL || 'debug',
  prettyPrint: process.env.LOG_PRETTY === 'true' || process.env.NODE_ENV !== 'production',
});

module.exports = pino;
