const { context, trace, SpanStatusCode } = require('@opentelemetry/api');
// const { CounterMetric } = require('@opentelemetry/metrics');

const _ = require('lodash');
const axios = require('axios').default;

const tracer = trace.getTracer('handlers/signup.js');

module.exports = async (req, res) => {
  req.log.debug({ headers: req.headers }, 'signing up new user');

  const user = _.get(req, 'body'); // FYI usually we would need to validate the user object - we will only validate the email via a simple regex below

  // INSTRUMENT (1) email validation [simple] - TASK trace
  // CODE BLOCK START - email validation
  let span = tracer.startSpan('validate email', { attributes: { 'app.user.email': user.email } });
  try {
    const simpleMailRegex = /\S+@\S+\.\S+/;
    const valid = simpleMailRegex.test(user.email);
    req.log.debug('isValidEmail: ' + valid);

    if (!valid) {
      span.addEvent('validation failed');

      throw new Error('Invalid email detected');
    }
  } catch (error) {
    span.setStatus(SpanStatusCode.ERROR);
    req.log.error(error);

    return res.status(400).send({ code: 'InvalidEmail' });
  } finally {
    span.end();
  }
  // CODE BLOCK END - email validation

  try {
    const users = req.db.collection('users');
    const operationResult = await users.insertOne(user); // FYI we store passwords in plain text (which is bad), but ok for demo purposes!

    req.log.debug({ operationResult }, 'created new user');
  } catch (error) {
    req.log.info(error);

    return res.status(500).send({ code: 'CreateUserError' });
  }

  // INSTRUMENT (2, optional) sending email [advanced] - TASK create nested spans
  // CODE BLOCK START - sending email
  span = tracer.startSpan('sending email', { attributes: { 'app.user.email': user.email } });
  const ctx = trace.setSpan(context.active(), span);
  try {
    // CODE BLOCK START (sub 1) - building payload
    const subspan = tracer.startSpan('building the payload', {}, ctx);
    req.log.info('building the payload...');

    const emailContent = {
      to: user.email,
      from: 'welcome@nptn.one',
      lang: req.query.lang || 'de',
      template: {
        name: 'user.signup',
        vars: {
          name: user.name,
        },
      },
    };
    subspan.end();
    // CODE BLOCK END (sub 1) - building payload

    // CODE BLOCK START (sub 2) - calling mail-service
    req.log.info('sending the email...');
    const { data } = await context.with(ctx, async () => {
      const subspan = tracer.startSpan('calling mail-service', {
        attributes: { 'app.mail-service': `${process.env.MAIL_SERVICE_BASE_URL}/send` },
      });

      try {
        return axios.post(`${process.env.MAIL_SERVICE_BASE_URL}/send`, emailContent);
      } catch (error) {
        subspan.setStatus(SpanStatusCode.ERROR);
        req.log.error(error);

        throw new Error('sending the email failed');
      } finally {
        subspan.end();
      }
    });
    req.log.debug({ res: data }, 'done');
    // CODE BLOCK END (sub 2) - calling mail-service

    return res.end();
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    req.log.error(error);

    return res.status(500).send();
  } finally {
    span.end();
  }
  // CODE BLOCK START - sending email
};
