const { context, trace } = require('@opentelemetry/api');
const pino = require('pino')({
  name: process.env.SERVICE_NAME,
  base: undefined,
  messageKey: 'content',
  // nestedKey: 'meta', // NOTE allow dt.trace_id and dt.span_id to be top level children
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  mixin() {
    const ctx = trace.getSpanContext(context.active());

    if (ctx) {
      return { reqId: `api-${ctx.traceId}` };
    }

    return {};
  },
  level: process.env.LOG_LEVEL || 'debug',
});

module.exports = { log: pino };
