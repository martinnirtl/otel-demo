// const { BasicTracerProvider } = require('@opentelemetry/tracing');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
const { log } = require('./logging');

log.info('initializing the tracing module...');

// const tracerProvider = new BasicTracerProvider();
// tracerProvider.register();

registerInstrumentations({
  // tracerProvider,
  instrumentations: [new IORedisInstrumentation()],
});
