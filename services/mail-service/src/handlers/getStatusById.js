const _ = require('lodash');

module.exports = async (req, res) => {
  const id = _.get(req, 'params.id', '').toLowerCase();

  req.log.info('retrieving status from db...');
  const status = (await req.cache.get(id)) || 'unknown';

  return res.status(200).send({ id, status });
};
