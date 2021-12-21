const pinoHttp = require('pino-http');
const pretty = require('pino-pretty');

const pino = pinoHttp(
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
    quietReqLogger: true,
  },
  pretty({
    colorize: true,
    messageKey: 'content',
  }),
);

module.exports = pino;
