const { BasicTracerProvider, SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
// const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-proto');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

const collectorOptions = {
  url: `${DT_ENV_URL}//api/v2/otlp/v1/traces`, // url is optional and can be omitted - default is http://localhost:55681/v1/trace
  headers: {
    Authorization: `Api-Token ${process.env.DT_TOKEN}`,
  },
};

const tracerProvider = new BasicTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'mail-service',
  }),
});

const exporter = new CollectorTraceExporter(collectorOptions);
tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter, {
  // The maximum queue size. After the size is reached spans are dropped.
  maxQueueSize: 1000,
  // The interval between two consecutive exports
  scheduledDelayMillis: 30000,
}));
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