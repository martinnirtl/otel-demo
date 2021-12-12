// INSTRUMENT (7) libs - gRPC server and redis client [advanced] - TASK configure instrumentation
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');
const { diag, DiagLogLevel } = require('@opentelemetry/api');

const { log } = require('./logging');
diag.setLogger(
  log.child(
    {},
    {
      name: 'diag',
      customLevels: {
        verbose: 0,
      },
      level: 'verbose',
    },
  ),
  DiagLogLevel.ALL,
);

log.info('initializing the tracing module...');

registerInstrumentations({
  instrumentations: [new IORedisInstrumentation(), new GrpcInstrumentation()],
});
