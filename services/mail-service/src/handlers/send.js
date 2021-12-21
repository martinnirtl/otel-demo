const _ = require('lodash');
const axios = require('axios').default;
const { nanoid } = require('nanoid');

const { client: templateService } = require('../templateService');

module.exports = async (req, res) => {
  req.log.info({ headers: req.headers }, 'processing mail');

  const sid = _.get(req, 'body.sid', nanoid(10));

  // INSTRUMENT (4, optional) extracting variables [simple] - TASK trace extraction and add span attribute for template name
  // CODE BLOCK START - extracting variables
  const template = _.get(req, 'body.template');
  let subject = _.get(req, 'body.subject');
  let text = _.get(req, 'body.text');
  // CODE BLOCK END - extracting variables

  // INSTRUMENT (5, optional) render template [advanced] - TASK add random baggage
  let renderedTemplate;
  if (template) {
    // CODE BLOCK START - render template
    // FYI baggage is propagated automatically as it's set on the active context
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

      renderedTemplate = { subject, body };
    } catch (error) {
      req.log.error(error);

      renderedTemplate = null;
    }
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
  let data;
  req.log.info('sending mail payload to mail-provider...');

  try {
    const res = await axios.post('https://httpbin.org/anything', {
      data: {
        subject,
        text,
      },
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
    data = res.data;
  } catch (error) {
    req.log.error(error);

    data = null; // can be omitted
  }
  // CODE BLOCK END - deliver mail

  if (!data) {
    req.log.error('sending failed');
    return res.status(500).send({ status: 'failed', sid, code: 'SendingFailed', message: 'Failed to send email' });
  }

  req.log.info('sending response...');
  return res.status(200).send({ status: 'accepted', sid });
};
