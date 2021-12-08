const { log } = require('./src/logging');
const { doSignUp } = require('./src/generator');

log.info('running sign up...');
doSignUp();
