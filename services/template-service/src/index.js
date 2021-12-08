const PROTO_PATH = __dirname + '/../protos/template-service.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { log } = require('./logging');
const { render } = require('./handlers/renderer');

log.info(`loading the proto file from: ${PROTO_PATH}`);
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const templateServiceProto = grpc.loadPackageDefinition(packageDefinition).templateservice;

const server = new grpc.Server();
server.addService(templateServiceProto.TemplateService.service, { render });
server.bindAsync(`0.0.0.0:${process.env.PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (!error) {
    server.start();

    log.info(`server listening on port ${port}`);
  }
});

// TODO maybe need to switch over to use shutdown hook lib
process.on('SIGINT', async () => {
  log.info('received a SIGINT signal. going down...');

  server.tryShutdown(error => {
    if (error) {
      log.error(error);

      log.info('forcefully shutting down the server...');
      server.forceShutdown();
    }

    log.info('server is shutdown');
  });
});
