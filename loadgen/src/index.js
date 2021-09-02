const faker = require('faker');
const axios = require('axios');

setInterval(async () => {
  console.log('generating user...');
  const user = {
    email: faker.internet.email,
    password: faker.internet.password(),
    name: `${faker.name.firstName()} ${faker.name.lastName()}`
  };

  console.log(`signing up ${user.email}...`);
  await axios.post(`${process.env.BACKEND_BASE_URL}/signUp`, user);
}, 60000);