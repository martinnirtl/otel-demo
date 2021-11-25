const Redis = require('ioredis');
const { log } = require('./logging');

log.info('connecting to redis cache...');

exports.cache = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
  keyPrefix: 'template-service',
});

exports.keyify = (prefix, ...keys) => [prefix, ...keys].join(':');

// TODO maybe need to switch over to use shutdown hook lib
process.on('SIGINT', async () => {
  log.info('received a SIGINT signal. going down...');

  log.info('disconnecting from redis cache...');
  await this.cache.disconnect();
});
