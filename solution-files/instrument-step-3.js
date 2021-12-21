// SOLUTION (3) service [advanced] - TASK configure SDK
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc'); // OTLP GRPC - will be renamed to @opentelemetry/exporter-otlp-grpc
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');

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
    new GrpcInstrumentation(),
    new IORedisInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});
