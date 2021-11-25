const faker = require('faker');
const axios = require('axios').default;
const express = require('express');

const { log } = require('./logging');

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.send('API coming soon or maybe never :)) 24.11.2021'));

const doSignUp = async () => {
  log.info('generating user...');

  const user = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  };

  log.info(`signing up ${user.email}...`);
  try {
    await axios.post(`${process.env.BACKEND_BASE_URL}/signup`, user, {
      headers: {
        'user-agent': faker.internet.userAgent(),
      },
    });
  } catch (error) {
    log.error(error);
  }
};

setInterval(() => {
  const signUps = faker.datatype.number({ min: 1, max: 10 });

  for (let i = 0; i < signUps; i++) {
    doSignUp().catch(error => log.error(error));
  }
}, 60000);
