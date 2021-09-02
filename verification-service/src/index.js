const PROTO_PATH = __dirname + '/../protos/verification-service.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const { log } = require('./logging');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const verification_proto = grpc.loadPackageDefinition(packageDefinition).verificationservice;

const isValidEmail = (call, callback) => {
  log.info('checking email address: ' + call.request.email);

  callback(null, { valid: true });
}

const server = new grpc.Server();
server.addService(verification_proto.VerificationService.service, { isValidEmail });
server.bindAsync(`0.0.0.0:${process.env.PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (!error) {
    server.start();

    log.info(`server listening on port ${port}`);
  }
});