const { context, trace } = require('@opentelemetry/api');
const { v4: uuid } = require('uuid');

const pino = require('pino-http')({
  name: process.env.SERVICE_NAME,
  base: undefined,
  messageKey: 'content',
  // nestedKey: 'meta', // NOTE allow dt.trace_id and dt.span_id to be top level children
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  genReqId(req) {
    const ctx = trace.getSpanContext(context.active());
    const traceparent = req.get('traceparent');

    if (ctx) {
      return `api-${ctx.traceId}`;
    }

    return traceparent ? `header-${traceparent.split('-')[1]}` : `uuid-${uuid()}`;
  },
  level: process.env.LOG_LEVEL || 'debug',
  quietReqLogger: true,
});

module.exports = pino;
