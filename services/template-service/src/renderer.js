const { log } = require('./logging');
const { cache, keyify } = require('./cache');

const templates = {
  'user.signup': vars => ({
    subject: 'Welcome!',
    body: `Hi ${vars.name}\nThanks for signing up to our product!\n\nRegards,\nThe Team`,
  }),
};

exports.render = async ({ request, metadata }, callback) => {
  // log.debug({ traceparent: metadata.get('traceparent')[0] }, 'rendering got called');
  log.debug({ traceparent: metadata.getMap() }, 'rendering got called');

  const template = request.name;
  const vars = request.vars;
  const key = keyify(template, Object.values(vars));

  log.debug('created key: ' + key);

  const subject = await cache.get(key + '.subject');
  const body = await cache.get(key + '.body');
  if (subject && body) {
    log.info('responding with rendered template from cache');

    return callback(null, { success: true, subject, body });
  }

  let rendered;
  try {
    log.info('rendering template: ' + template);

    rendered = templates[template](vars);

    log.debug(rendered, 'rendering finished');
  } catch (error) {
    log.error(error);

    return callback({ code: 'NoSuchTemplate', message: 'No such template!' }, { success: false });
  }

  try {
    log.info('adding just rendered template to cache...');

    await cache.setex(key + '.subject', 600, rendered.subject);
    await cache.setex(key + '.body', 600, rendered.body);
  } catch (error) {
    log.error(error);
  }

  log.info('returning the rendered template...');
  return callback(null, { success: true, subject: rendered.subject, body: rendered.body });
};
