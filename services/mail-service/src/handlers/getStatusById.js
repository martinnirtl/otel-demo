const _ = require('lodash');
const { cache } = require('../cache');

module.exports = async (req, res) => {
  const id = _.get(req, 'params.id', '').toLowerCase();

  req.log.info('retrieving status from db...');
  const status = (await cache.get(id)) || 'unknown';

  return res.status(200).send({ id, status });
};
