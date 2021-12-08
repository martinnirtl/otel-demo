const opentelemetry = require('@opentelemetry/api');
// const { CounterMetric } = require('@opentelemetry/metrics');

const _ = require('lodash');
const axios = require('axios').default;

const tracer = opentelemetry.trace.getTracer('handlers/signup.js');

module.exports = async (req, res) => {
  const user = _.get(req, 'body');
  req.log.debug({ user }, 'signing up new user');

  try {
    // TODO verify email by regex
    const valid = true;
    req.log.debug('isValidEmail: ' + valid);

    if (!valid) {
      throw new Error('Invalid email detected');
    }
  } catch (error) {
    req.log.error(error);

    return res.status(400).send({ code: 'InvalidEmail' });
  }

  try {
    const users = req.db.collection('users');

    const operationResult = await users.insertOne(user); // we store passwords in plain text (which is bad), but ok for demo purposes!
    req.log.debug({ operationResult }, 'created new user');
  } catch (error) {
    req.log.info(error);

    return res.status(400).send({ code: 'CreateUserError' });
  }

  // const currentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active());
  // req.log.info(`traceid: ${currentSpan.spanContext().traceId}`);

  // const span = tracer.startSpan('Send newsletter subscription mail', { attributes: req.body });
  // const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), sendConfirmationEmailSpan);

  try {
    req.log.info('building the payload...');
    const span = tracer.startSpan('Build payload', { attributes: { 'app.user.email': user.email } });

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

    req.log.info('sending the email...');
    const { data } = await axios.post(`${process.env.MAIL_SERVICE_BASE_URL}/send`, emailContent);
    req.log.debug({ data }, 'done');

    // sendConfirmationEmailSpan.addEvent('send', emailContent);
    // sendConfirmationEmailSpan.setStatus({
    //   code: opentelemetry.SpanStatusCode.OK,
    // });
    // sendConfirmationEmailSpan.end();
    span.end();

    return res.end();
  } catch (error) {
    req.log.error(error);

    // sendConfirmationEmailSpan.setStatus({
    //   code: opentelemetry.SpanStatusCode.ERROR,
    //   message: error.message
    // });
    // sendConfirmationEmailSpan.end();

    return res.status(500).send();
  }
};
