const { MongoClient } = require('mongodb');

const dbConnectionURL = process.env.DB_CONNECTION_URL || 'mongodb://localhost:27017';
const mongoClient = new MongoClient(dbConnectionURL);

exports.connect = async () => {
  await mongoClient.connect();

  console.log('connected successfully to db server');
  db = mongoClient.db();
  
  return db;
};