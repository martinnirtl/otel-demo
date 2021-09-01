const opentelemetry = require('@opentelemetry/api');
// const { CounterMetric } = require('@opentelemetry/metrics');
const express = require('express');
const axios = require('axios').default;
const _ = require('lodash');

const { connect } = require('./db');
const { client: verify } = require('./verification');

const tracer = opentelemetry.trace.getTracer();

let db;
connect().then(database => { db = database });

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/users/:id', async (req, res) => {
  const users = db.collection('users');

  const user = await users.findOne({});

  res.status(200).send(user);
})

app.post('/subscribe', async (req, res) => {
  const email = _.get(req, 'body.email');

  const { valid } = verify.isValidEmail({ email });
  if (valid) {
    console.log('email is valid...')
  }


  const users = db.collection('users');
  
  // const currentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active());
  // console.log(`traceid: ${currentSpan.spanContext().traceId}`);

  // const span = tracer.startSpan('Send newsletter subscription mail', { attributes: req.body });
  // const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), sendConfirmationEmailSpan);

  try {
    console.log('rendering the email template');

    const buildPayloadSpan = tracer.startSpan('Build payload', { attributes: { userId: 1 }});
    // const buildPayloadSpan = tracer.startSpan('build payload', null, ctx);

    const user = await users.findOne({}); // find first user

    const emailContent = {
      id: 'D34AFG7',
      to: user.email,
      from: "newsletter@nptn.one",
      subject: "Newsletter",
      template: {
          name: "newsletter.subscribe",
          vars: {
              name: user.name
          }
      }
    };
    buildPayloadSpan.end();

    console.log('sending the email...');
    const { data } = await axios.post(`${process.env.MAIL_SERVICE_BASE_URL}/send`, emailContent);
    console.log(data);

    // sendConfirmationEmailSpan.addEvent('send', emailContent);
    // sendConfirmationEmailSpan.setStatus({
    //    code: opentelemetry.SpanStatusCode.OK,
    // });
    // sendConfirmationEmailSpan.end();

    console.log('confirmation email sent');

    return res.status(200).send();
  } catch (error) {
    console.error(error);

    // sendConfirmationEmailSpan.setStatus({
    //   code: opentelemetry.SpanStatusCode.ERROR,
    //   message: error.message
    // });
    // sendConfirmationEmailSpan.end();
    
    return res.status(500).send();
  }
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`listening on port ${port}`));

process.on("SIGINT", async () => {
  console.log('received a SIGINT signal. going down...')

  await db.close()
  server.close()
});
  
