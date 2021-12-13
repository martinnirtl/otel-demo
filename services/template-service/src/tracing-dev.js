const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base'); // exchange if possible
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc'); // OTLP GRPC - will be renamed to @opentelemetry/exporter-otlp-grpc
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { Resource } = require('@opentelemetry/resources');

const tracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'template-service',
  }),
});

if (!process.env.OTEL_ENDPOINT_URL) {
  throw new Error('no otel endpoint configured');
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
  instrumentations: [
    new PinoInstrumentation({
      // FYI optional hook to insert additional context to log object. trace_id and span_id will be added automatically
      logHook: (_span, record) => {
        record['resource.service.name'] = tracerProvider.resource.attributes['service.name'];
      },
    }),
    new IORedisInstrumentation(),
    new GrpcInstrumentation(),
  ],
});
