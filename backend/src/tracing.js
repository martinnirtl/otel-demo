// const opentelemetry = require('@opentelemetry/api');
const { BasicTracerProvider } = require('@opentelemetry/tracing');
const { logger } = require('./logging');

logger.info('initializing the tracing module...');

const tracerProvider = new BasicTracerProvider();
tracerProvider.register();
