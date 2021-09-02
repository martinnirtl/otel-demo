const opentelemetry = require('@opentelemetry/api');
// const { CounterMetric } = require('@opentelemetry/metrics');
const express = require('express');
const axios = require('axios').default;
const _ = require('lodash');
const exitHook = require('async-exit-hook');

const logging = require('./logging');
const { connect } = require('./db');
const { client: verify } = require('./verification');

const tracer = opentelemetry.trace.getTracer();

let db;
connect().then(database => { db = database });

const app = express();
app.use(express.json());
app.use(logging);

app.get('/users/:email', async (req, res) => {
  const email = _.get(req, 'params.email');

  const users = db.collection('users');

  const user = await users.findOne({ email }, {
    projection: { _id: 0, password: 0 },
  });

  res.status(200).send(user);
});

app.post('/signup', async (req, res) => {
  const user = _.get(req, 'body');

  req.log.info('signing up new user:');
  req.log.debug(user);

  try {
    const valid = await new Promise((resolve, _reject) => verify.isValidEmail({ email: user.email }, (error, { valid }) => resolve(valid)));
    req.log.debug('isValidEmail: ' + valid);
    
    if (!valid) {
      throw new Error('Invalid email detected');
    }
  } catch (error) {
    req.log.error(error);

    return res.status(400).send({ code: 'InvalidEmail' });
  }

  try {
    const users = db.collection('users');

    const operationResult = await users.insertOne(user); // we store passwords in plain text (which is bad), but ok for demo purposes!
    req.log.info(operationResult);
  } catch (error) {
    req.log.info(error);

    return res.status(400).send({ code: 'CreateUserError' });
  }
  
  // const currentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active());
  // req.log.info(`traceid: ${currentSpan.spanContext().traceId}`);

  // const span = tracer.startSpan('Send newsletter subscription mail', { attributes: req.body });
  // const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), sendConfirmationEmailSpan);

  try {
    req.log.info('sending email...');

    const span = tracer.startSpan('Build payload', { attributes: { 'user.email': user.email }});

    const emailContent = {
      to: user.email,
      from: 'welcome@nptn.one',
      lang: req.query.lang || 'de',
      template: {
          name: 'user.signup',
          vars: {
              name: user.name
          }
      }
    };

    req.log.info('sending the email...');
    const { data } = await axios.post(`${process.env.MAIL_SERVICE_BASE_URL}/send`, emailContent);
    req.log.info(data);

    // sendConfirmationEmailSpan.addEvent('send', emailContent);
    // sendConfirmationEmailSpan.setStatus({
    //    code: opentelemetry.SpanStatusCode.OK,
    // });
    // sendConfirmationEmailSpan.end();

    req.log.info('welcome email sent');
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
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => logging.logger.info(`listening on port ${port}`));

exitHook(async () => {
  logging.logger.info('app is going down...');

  await db.close()
  server.close()
});
  
