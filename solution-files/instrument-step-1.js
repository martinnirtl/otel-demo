// SOLUTION (1) email validation [simple] - TASK trace

// PASTE AT THE BEGINNING OF FILE
const { trace, SpanStatusCode } = require('@opentelemetry/api');
const tracer = trace.getTracer('handlers/signUp.js');

// PASTE IN CODE BLOCK
let span = tracer.startSpan('validate email', { attributes: { 'app.user.email': user.email } });
try {
  const simpleMailRegex = /\S+@\S+\.\S+/;
  const valid = simpleMailRegex.test(user.email);
  req.log.debug('isValidEmail: ' + valid);

  if (!valid) {
    span.addEvent('validation failed');

    return res.status(400).send({ code: 'InvalidEmail' });
  }
} catch (error) {
  span.setStatus(SpanStatusCode.ERROR);
  req.log.error(error);

  return res.status(500).send();
} finally {
  span.end();
}

// FIXED REGEX
const simpleMailRegex = /\S+@\S+\.\S+/;
