const { MongoClient } = require('mongodb');
const { logger } = require('./logging');

const dbConnectionURL = process.env.DB_CONNECTION_URL || 'mongodb://localhost:27017';
const mongoClient = new MongoClient(dbConnectionURL);

exports.connect = async () => {
  await mongoClient.connect();

  logger.info('connected successfully to db server');
  db = mongoClient.db();

  return db;
};
