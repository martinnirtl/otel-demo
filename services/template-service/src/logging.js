const pinoLib = require('pino');
const pretty = require('pino-pretty');

const pino = pinoLib(
  {
    name: process.env.SERVICE_NAME,
    base: undefined,
    messageKey: 'content',
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    level: process.env.LOG_LEVEL || 'debug',
  },
  pretty({
    colorize: true,
    messageKey: 'content',
  }),
);

module.exports = { log: pino };
