const faker = require('faker');
const axios = require('axios');

setInterval(async () => {
  const email = faker.internet.email();

  console.log('subscribing with email: ' + email);
  await axios.post(`${process.env.BACKEND_BASE_URL}/subscribe`, { email });
}, 60000);