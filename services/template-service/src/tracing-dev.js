const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base'); // exchange if possible
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc'); // OTLP GRPC - will be renamed to @opentelemetry/exporter-otlp-grpc
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { Resource } = require('@opentelemetry/resources');

const { log } = require('./logging');

log.info('initializing tracing module...');

const tracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'template-service',
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
  instrumentations: [new IORedisInstrumentation(), new GrpcInstrumentation()],
});
