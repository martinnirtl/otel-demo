const { log } = require('./logging');
const { start } = require('./generator');

log.info('starting the generator...');
start();
