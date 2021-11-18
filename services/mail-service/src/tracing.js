const { SimpleSpanProcessor, ConsoleSpanExporter, BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base'); // exchange if possible
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
// const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector');
// const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-proto');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { Resource } = require('@opentelemetry/resources');

const { logger } = require('./logging');

logger.info('initializing tracing module...');

// const collectorOptions = {
//   url: process.env.OTEL_ENDPOINT_URL,
//   headers: {
//     Authorization: process.env.OTEL_AUTH_HEADER,
//   },
// };

const collectorOptions = {
  url: process.env.OTEL_ENDPOINT_URL,
};

const tracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'mail-service',
  }),
});

if (process.env.OTEL_EXPORT_ENABLE === 'true') {
  const exporter = new CollectorTraceExporter(collectorOptions);
  // tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter, {
  //   // The maximum queue size. After the size is reached spans are dropped.
  //   maxQueueSize: 1000,
  //   // The interval between two consecutive exports
  //   scheduledDelayMillis: 30000,
  // }));
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter)); // using simpleSpanProcessor as otel-collector and grpc exporter in place
}
if (process.env.NODE_ENV !== 'production') {
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
}

tracerProvider.register();

registerInstrumentations({
  tracerProvider,
  instrumentations: [new IORedisInstrumentation(), new HttpInstrumentation(), new ExpressInstrumentation()],
});
