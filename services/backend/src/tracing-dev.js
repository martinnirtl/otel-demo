const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base'); // FIXME exchange if possible
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb');
const { Resource } = require('@opentelemetry/resources');

const tracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'backend',
  }),
});

if (!process.env.OTEL_ENDPOINT_URL) {
  throw new Error('otel endpoint not defined');
}

const exporter = new CollectorTraceExporter({
  url: process.env.OTEL_ENDPOINT_URL,
});
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter));

if (process.env.NODE_ENV !== 'production' && process.env.OTEL_DEBUG) {
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
}

tracerProvider.register();

registerInstrumentations({
  tracerProvider,
  instrumentations: [
    new PinoInstrumentation({
      // FYI optional hook to insert additional context to log object. trace_id and span_id will be added automatically
      logHook: (_span, record) => {
        record['resource.service.name'] = tracerProvider.resource.attributes['service.name'];
      },
    }),
    new MongoDBInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});
