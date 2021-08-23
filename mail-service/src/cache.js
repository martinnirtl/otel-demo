const Redis = require('ioredis');

console.log('connecting to redis cache...');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
  keyPrefix: 'mail-service',
});

exports.cache = redis;