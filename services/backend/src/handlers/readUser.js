const _ = require('lodash');

module.exports = async (req, res) => {
  const email = _.get(req, 'params.email');

  const users = req.db.collection('users');

  const user = await users.findOne(
    { email },
    {
      projection: { _id: 0, password: 0 },
    },
  );

  res.status(200).send(user);
};
