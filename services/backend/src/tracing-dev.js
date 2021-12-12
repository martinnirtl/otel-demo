const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base'); // exchange if possible
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
// const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector'); // OTLP HTTP - will be renamed to @opentelemetry/exporter-otlp-http
// const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-proto'); OTLP PROTO - will be renamed to @opentelemetry/exporter-otlp-proto
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc'); // OTLP GRPC - will be renamed to @opentelemetry/exporter-otlp-grpc
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb');
const { Resource } = require('@opentelemetry/resources');

const { logger } = require('./logging');

logger.info('initializing tracing module...');

const tracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'backend',
  }),
});

if (process.env.OTEL_ENDPOINT_URL) {
  const exporter = new CollectorTraceExporter({
    url: process.env.OTEL_ENDPOINT_URL,
  });
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter)); // using simpleSpanProcessor as otel-collector and grpc exporter in place
}

if (process.env.NODE_ENV !== 'production' && process.env.OTEL_DEBUG) {
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
}

tracerProvider.register();

registerInstrumentations({
  tracerProvider,
  instrumentations: [new MongoDBInstrumentation(), new HttpInstrumentation(), new ExpressInstrumentation()],
});
