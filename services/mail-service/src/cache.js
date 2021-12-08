const Redis = require('ioredis');
const { logger } = require('./logging');

logger.info('connecting to redis db...');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
  keyPrefix: 'mail-service',
});

module.exports = redis;
