const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base'); // exchange if possible
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');
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

const tracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'mail-service',
  }),
});

if (process.env.OTEL_ENDPOINT_URL) {
  const exporter = new CollectorTraceExporter({
    url: process.env.OTEL_ENDPOINT_URL,
  });
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter)); // using simpleSpanProcessor as otel-collector and grpc exporter in place

  // tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter, {
  //   // The maximum queue size. After the size is reached spans are dropped.
  //   maxQueueSize: 1000,
  //   // The interval between two consecutive exports
  //   scheduledDelayMillis: 30000,
  // }));
}

if (process.env.NODE_ENV !== 'production') {
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
}

tracerProvider.register();

registerInstrumentations({
  tracerProvider,
  instrumentations: [
    new GrpcInstrumentation(),
    new IORedisInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});
