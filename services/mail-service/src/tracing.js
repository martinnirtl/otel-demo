// INSTRUMENT (3) service [advanced] - TASK configure SDK
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc'); // OTLP GRPC - will be renamed to @opentelemetry/exporter-otlp-grpc
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
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

  // FYI alternate solution with batch processor
  // tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter, {
  //   // The maximum queue size. After the size is reached spans are dropped.
  //   maxQueueSize: 1000,
  //   // The interval between two consecutive exports
  //   scheduledDelayMillis: 30000,
  // }));
}

if (process.env.NODE_ENV !== 'production' && process.env.OTEL_DEBUG) {
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
}

tracerProvider.register();

registerInstrumentations({
  tracerProvider,
  instrumentations: [
    // TODO currently using ^0.28.0 while other otel-modules are ^0.24.0
    new PinoInstrumentation({
      // FYI optional hook to insert additional context to log object. trace_id and span_id will be added automatically
      logHook: (span, record) => {
        record['resource.service.name'] = tracerProvider.resource.attributes['service.name'];

        // we will also populate `dt.trace_id` and `dt.span_id`
        const ctx = span.spanContext();

        record['dt.trace_id'] = ctx.traceId;
        record['dt.span_id'] = ctx.spanId;
      },
    }),
    new GrpcInstrumentation(),
    new IORedisInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});
