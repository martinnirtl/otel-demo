const api = require('@opentelemetry/api');
const express = require('express');
const _ = require('lodash');
const axios = require('axios').default;
const { nanoid } = require('nanoid');

const logging = require('./logging');
const { cache } = require('./cache');

const tracer = api.trace.getTracer();

const app = express();
app.use(express.json());
app.use(logging);

app.post('/send', async (req, res) => {
  req.log.debug(req.headers);
  // req.log.info(api.context.active());
  const sid = _.get(req, 'body.sid', nanoid(10));

  const span = tracer.startSpan('Extracting variables', { attributes: { 'app.mail.sid': sid } });

  const template = _.get(req, 'body.template');
  let text = _.get(req, 'body.text');

  span.end();

  try {
    const baggage = api.propagation.createBaggage({ hello: { value: 'world', metadata: ['foo', 'bar'] } });
    let context = api.context.active();
    context = api.propagation.setBaggage(context, baggage);
    const headers = {};
    api.propagation.inject(context, headers);

    if (template) {
      req.log.info('calling template-service to render text...');
      text = await axios.post(process.env.TEMPLATE_SERVICE_BASE_URL + '/render', { template }, { headers });
    }

    if (!text) {
      throw new Error('Empty text field is not allowed');
    }

    req.log.info('sending mail payload to mail-provider...');
    const { data } = await axios.get(`https://httpbin.org/headers`, {
      // ...body,
      // template: undefined,
      // text,
      headers,
    });
    req.log.info('mail sent');
    req.log.info(data);

    if (sid) {
      req.log.info('persisting status in db...');

      cache.setex(sid, 86400, 'accepted').catch(error => req.log.error(error));
    }

    req.log.info('sending response...');
    return res.status(200).send({ status: 'accepted', sid });
  } catch (error) {
    req.log.error(error);

    return res.status(500).send({ code: 'SendingFailed', message: 'Failed to send email' });
  }
});

app.get('/status/:id', async (req, res) => {
  const id = _.get(req, 'params.id', '').toLowerCase();

  req.log.info('retrieving status from db...');
  const status = (await cache.get(id)) || 'unknown';

  return res.status(200).send({ id, status });
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => logging.logger.info(`listening on port ${port}`));

process.on('SIGINT', () => {
  logging.logger.info('received a SIGINT signal. going down...');

  server.close();
});
