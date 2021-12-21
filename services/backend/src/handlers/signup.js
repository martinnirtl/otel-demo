const _ = require('lodash');
const axios = require('axios').default;

module.exports = async (req, res) => {
  req.log.debug({ headers: req.headers }, 'signing up new user');

  const user = _.get(req, 'body'); // FYI usually we would need to validate the user object - we will only validate the email via a simple regex below

  // INSTRUMENT (1) email validation [simple] - TASK trace
  // CODE BLOCK START - email validation
  try {
    const simpleMailRegex = '/S+@S+.S+/';
    const valid = simpleMailRegex.test(user.email);
    req.log.debug('isValidEmail: ' + valid);

    if (!valid) {
      return res.status(400).send({ code: 'InvalidEmail' });
    }
  } catch (error) {
    req.log.error(error);

    return res.status(500).send();
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

  // CODE BLOCK START (sub 1) - building payload
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
  // CODE BLOCK END (sub 1) - building payload

  // CODE BLOCK START (sub 2) - calling mail-service
  req.log.info('sending the email...');
  try {
    const { data } = await axios.post(`${process.env.MAIL_SERVICE_BASE_URL}/send`, emailContent);

    req.log.debug({ res: data }, 'done');
  } catch (error) {
    req.log.error(error);

    return res.status(500).send({ status: 'failed', code: 'SendingFailed' });
  }

  return res.end();

  // CODE BLOCK START - sending email
};
