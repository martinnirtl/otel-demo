const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');
const { log } = require('./logging');

log.info('initializing the tracing module...');

registerInstrumentations({
  instrumentations: [new IORedisInstrumentation(), new GrpcInstrumentation()],
});
