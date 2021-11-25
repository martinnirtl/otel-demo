const pino = require('pino')({
  name: process.env.SERVICE_NAME,
  base: undefined,
  messageKey: 'content',
  nestedKey: 'meta',
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  level: process.env.LOG_LEVEL || 'debug',
});

module.exports = { log: pino };
