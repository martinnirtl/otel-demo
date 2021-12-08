const express = require('express');

const logging = require('./logging');
const send = require('./handlers/send');
const getStatusById = require('./handlers/getStatusById');

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(logging);

app.post('/send', send);
app.get('/status/:id', getStatusById);

const port = process.env.PORT || 4100;

const server = app.listen(port, () => logging.logger.info(`listening on port ${port}`));

process.on('SIGINT', () => {
  logging.logger.info('received a SIGINT signal. going down...');

  server.close();
});
