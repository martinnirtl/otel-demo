const opentelemetry = require('@opentelemetry/api');
const _ = require('lodash');
const axios = require('axios').default;
const { nanoid } = require('nanoid');

const { cache } = require('../cache');
const { client: templateService } = require('../templateService');

const tracer = opentelemetry.trace.getTracer('handers/send.js');

module.exports = async (req, res) => {
  req.log.debug(req.headers);
  // req.log.info(api.context.active());
  const sid = _.get(req, 'body.sid', nanoid(10));

  const span = tracer.startSpan('Extracting variables', { attributes: { 'app.mail.sid': sid } });

  const template = _.get(req, 'body.template');
  let subject = _.get(req, 'body.subject');
  let text = _.get(req, 'body.text');

  span.end();

  try {
    const baggage = opentelemetry.propagation.createBaggage({ hello: { value: 'world', metadata: ['foo', 'bar'] } });
    let context = opentelemetry.context.active();
    context = opentelemetry.propagation.setBaggage(context, baggage);
    const headers = {};
    opentelemetry.propagation.inject(context, headers);

    if (template) {
      req.log.info(template, 'calling template-service to render text...');
      // text = await axios.post(process.env.TEMPLATE_SERVICE_BASE_URL + '/render', { template }, { headers });
      const renderedTemplate = await new Promise((resolve, reject) =>
        templateService.render(template, (error, response) => {
          req.log.info({ error, response }, 'received response');

          if (error || !response.success) {
            return reject(error || new Error('Invokation of template-service failed!'));
          }

          return resolve(response);
        }),
      );

      subject = renderedTemplate.subject;
      text = renderedTemplate.body;
    }

    if (!text) {
      throw new Error('Empty text field is not allowed');
    }

    req.log.info('sending mail payload to mail-provider...');
    const { data } = await axios.post(`https://httpbin.org/anything`, {
      data: {
        subject,
        text,
      },
      headers,
    });
    req.log.info(data, 'mail sent');
    // req.log.info(data);

    if (sid) {
      req.log.info('persisting status in db...');

      cache.setex(sid, 86400, 'accepted').catch(error => req.log.error(error));
    }

    req.log.info('sending response...');
    return res.status(200).send({ status: 'accepted', sid });
  } catch (error) {
    req.log.error(error);

    return res.status(500).send({ status: 'failed', sid, code: 'SendingFailed', message: 'Failed to send email' });
  }
};
