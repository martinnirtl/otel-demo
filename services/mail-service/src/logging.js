const pino = require('pino-http')({
  // name: process.env.SERVICE_NAME,
  // base: undefined,
  messageKey: 'content',
  // nestedKey: 'meta', // NOTE allow dt.trace_id and dt.span_id to be top level children
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  level: process.env.LOG_LEVEL || 'debug',
  quietReqLogger: true,
});

module.exports = pino;
