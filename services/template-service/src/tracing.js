// const { BasicTracerProvider } = require('@opentelemetry/tracing');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { log } = require('./logging');

log.info('initializing the tracing module...');

// const tracerProvider = new BasicTracerProvider();
// tracerProvider.register();

registerInstrumentations({
  instrumentations: [new IORedisInstrumentation(), new GrpcInstrumentation(), new HttpInstrumentation()],
});
