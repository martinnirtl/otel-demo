const { context, trace, propagation, SpanStatusCode } = require('@opentelemetry/api');
const _ = require('lodash');
const axios = require('axios').default;
const { nanoid } = require('nanoid');

const { client: templateService } = require('../templateService');

const tracer = trace.getTracer('handers/send.js');

module.exports = async (req, res) => {
  req.log.info({ headers: req.headers }, 'processing mail');
  req.log.debug({ ctx: trace.getSpanContext(context.active()) }, 'active otel context');

  const sid = _.get(req, 'body.sid', nanoid(10));

  // INSTRUMENT (4, optional) extracting variables [simple] - TASK trace
  // CODE BLOCK START - extracting variables
  const span = tracer.startSpan('extracting variables', { attributes: { 'app.mail.sid': sid } });
  const template = _.get(req, 'body.template');
  let subject = _.get(req, 'body.subject');
  let text = _.get(req, 'body.text');

  span.end();
  // CODE BLOCK END - extracting variables

  // INSTRUMENT (5, optional) render template [advanced] - TASK add random baggage
  const baggage = propagation.createBaggage({ hello: { value: 'world', metadata: ['foo', 'bar'] } });
  const ctx = propagation.setBaggage(context.active(), baggage);
  // const headers = {};
  // propagation.inject(context, headers);

  let renderedTemplate;
  if (template) {
    // CODE BLOCK START - render template
    // FYI baggage is propagated automatically as it's set on the active context
    renderedTemplate = await tracer.startActiveSpan(
      'render template',
      { attributes: { 'app.template.name': template.name } },
      ctx,
      async span => {
        req.log.info(template, 'calling template-service to render text...');

        try {
          const { subject, body } = await new Promise((resolve, reject) =>
            templateService.render(template, (error, response) => {
              req.log.info({ error, response }, 'received response');

              if (error || !response.success) {
                return reject(error || new Error('Invokation of template-service failed!'));
              }

              return resolve(response);
            }),
          );
          return { subject, body };
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          req.log.error(error);

          return null;
        } finally {
          span.end();
        }
      },
    );
    // CODE BLOCK END - render template

    if (!renderedTemplate) {
      req.log.error('rendering failed');

      return res.status(500).send({ status: 'failed', sid, code: 'SendingFailed', message: 'Failed to send email' });
    }

    subject = renderedTemplate.subject;
    text = renderedTemplate.body;
  }

  // CODE BLOCK START - deliver mail
  // FYI baggage is propagated automatically as it's set on the active context
  const data = await tracer.startActiveSpan(
    'deliver mail',
    {
      attributes: { 'app.mail.external': 'https://httpbin.org/anything' },
    },
    ctx,
    async span => {
      try {
        req.log.info('sending mail payload to mail-provider...');

        const { data } = await axios.post('https://httpbin.org/anything', {
          data: {
            subject,
            text,
          },
          // headers,
        });
        req.log.info(
          {
            body: {
              subject,
              text,
            },
            data,
          },
          'mail sent',
        );

        if (sid) {
          req.log.info('persisting status in db...');

          req.cache.setex(sid, 86400, 'accepted').catch(error => req.log.error(error));
        }
        return data;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        req.log.error(error);

        return null;
      } finally {
        span.end();
      }
    },
  );
  // CODE BLOCK END - deliver mail

  if (!data) {
    req.log.error('sending failed');
    return res.status(500).send({ status: 'failed', sid, code: 'SendingFailed', message: 'Failed to send email' });
  }

  req.log.info('sending response...');
  return res.status(200).send({ status: 'accepted', sid });
};
