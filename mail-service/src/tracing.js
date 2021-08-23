const { SimpleSpanProcessor, ConsoleSpanExporter, BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base'); // exchange if possible
const { NodeTracerProvider,  } = require('@opentelemetry/sdk-trace-node');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
// const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-proto');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { Resource } = require('@opentelemetry/resources');

console.log('initializing tracing module...')

const collectorOptions = {
  url: process.env.OTEL_BACKEND_URL, // url is optional and can be omitted - default is http://localhost:55681/v1/trace
  headers: {
    Authorization: process.env.OTEL_AUTH_HEADER,
  },
};

const tracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'mail-service',
  }),
});

if (process.env.OTEL_EXPORT_ENABLE) {
  const exporter = new CollectorTraceExporter(collectorOptions);
  tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter, {
    // The maximum queue size. After the size is reached spans are dropped.
    maxQueueSize: 1000,
    // The interval between two consecutive exports
    scheduledDelayMillis: 30000,
  }));
}
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

tracerProvider.register();

registerInstrumentations({
  tracerProvider,
  instrumentations: [
    new IORedisInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});