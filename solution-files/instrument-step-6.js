// SOLUTION (6) libs - gRPC server and redis client [advanced] - TASK configure instrumentation
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');

registerInstrumentations({
  instrumentations: [new IORedisInstrumentation(), new GrpcInstrumentation(), new PinoInstrumentation()],
});
