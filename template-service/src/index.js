const express = require('express');
const _ = require('lodash');
const { cache, keyify } = require('./cache');

const templates = {
  'newsletter.subscribe': (vars) => `Hi ${vars.name}\nThanks for signing up to our newsletter!\n\nRegards,\nThe Team`
};

const app = express();
app.use(express.json());

app.post('/render', async function(req, res) {
  const template = _.get(req, 'body.template.name');
  const vars = _.get(req, 'body.template.vars');
  const key = keyify(template, Object.values(vars));

  console.log('created key: ' + key);

  let text = await cache.get(key);
  if (text) {
    console.log('responding with rendered text from cache');

    return res.status(200).send({ text });
  }

  try {
    console.log('rendering template: ' + template);

    

    text = templates[template](vars);
  } catch (error) {
    console.error(error);

    return res.status(500).send({ code: 'NoSuchTemplate', message: 'No such template!' });
  }

  try {
    console.log('adding just rendered text to cache...');

    await cache.setex(key, 600, text);
  } catch (error) {
    console.error(error);
  }

  console.log('returning the rendered text');
  return res.status(200).send({ text });
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => console.log(`listening on port ${port}`));

process.on("SIGINT", () => {
  console.log('received a SIGINT signal. going down...');

  server.close();
});