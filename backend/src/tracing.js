// const opentelemetry = require('@opentelemetry/api');
const { BasicTracerProvider } = require('@opentelemetry/tracing');

console.log('initializing the tracing module...');

const tracerProvider = new BasicTracerProvider();
tracerProvider.register();