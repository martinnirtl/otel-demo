const faker = require('faker');
const axios = require('axios');

setInterval(async () => {
  await axios.post(`${process.env.BACKEND_BASE_URL}/subscribe`, { email: faker.internet.email() });

}, 60000);