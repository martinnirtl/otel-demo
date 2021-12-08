const express = require('express');
const exitHook = require('async-exit-hook');

const logging = require('./logging');
const cache = require('./cache');
const send = require('./handlers/send');
const getStatusById = require('./handlers/getStatusById');

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(logging);
app.use((req, _res, next) => {
  req.cache = cache;

  next();
});

app.post('/send', send);
app.get('/status/:id', getStatusById);

const port = process.env.PORT || 4100;

const server = app.listen(port, () => logging.logger.info(`listening on port ${port}`));

exitHook(async () => {
  logging.logger.info('received a exit signal. going down...');

  cache.disconnect();
  server.close();
});
