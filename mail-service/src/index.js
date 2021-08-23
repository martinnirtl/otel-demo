const api = require('@opentelemetry/api');
const express = require('express');
const _ = require('lodash')
const axios = require('axios').default;

const { cache } = require('./cache');

const tracer = api.trace.getTracer();

const app = express();
app.use(express.json());

app.post('/send', async (req, res) => {
  console.log(req.headers);
  console.log(api.context.active());

  const span = tracer.startSpan('Extracting variables', { attributes: req.body });
  const id = _.get(req, 'body.id', undefined);
  const body = _.get(req, 'body');
  const template = _.get(req, 'body.template');
  let text = _.get(req, 'body.text');
  span.end();

  try {
    if (template) {
      console.log('calling template-service to render text...');
      text = await axios.post(process.env.TEMPLATE_SERVICE_BASE_URL + '/render', { template });
    }

    if (!text) {
      throw new Error('Empty text field is not allowed');
    }

    console.log('sending mail payload to mail-provider...');
    const { data } = await axios.get(`https://httpbin.org/headers`, {
      ...body,
      template: undefined,
      text,
    });
    console.log('mail sent');
    console.log(data);

    if (id) {
      console.log('persisting status in db...');

      await cache.setex(id.toLowerCase(), 86400, 'accepted');
    }

    console.log('sending response...');
    return res.status(200).send({ status: 'accepted' });
  } catch (error) {
    console.error(error);

    return res.status(500).send({ code: 'SendingFailed', message: 'Failed to send email' });
  }
});

app.get('/status/:id', async (req, res) => {
  const id = _.get(req, 'params.id', '').toLowerCase();

  console.log('retrieving status from db...');
  const status = await cache.get(id) || 'unknown';

  return res.status(200).send({ id, status });
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => console.log(`listening on port ${port}`));

process.on("SIGINT", () => {
  console.log('received a SIGINT signal. going down...')

  server.close()
});