const express = require('express');
const exitHook = require('async-exit-hook');

const logging = require('./logging');
const { connect } = require('./db');

const signup = require('./handlers/signup');
const readUser = require('./handlers/readUser');

const main = async () => {
  const db = await connect();

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(logging);
  app.use((req, _res, next) => {
    req.db = db;

    next();
  });

  app.get('/users/:email', readUser);
  app.post('/signup', signup);

  const port = process.env.PORT || 4000;
  const server = app.listen(port, () => logging.logger.info(`listening on port ${port}`));

  exitHook(async () => {
    logging.logger.info('app is going down...');

    await db.close();
    server.close();
  });
};

main().catch(error => {
  logging.logger.error(error);

  process.exitCode = 1;
});
