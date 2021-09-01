const PROTO_PATH = __dirname + '/../../protos/verification-service.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const verification_proto = grpc.loadPackageDefinition(packageDefinition).verificationservice;

/**
 * Implements the SayHello RPC method.
 */
function isValidEmail(call, callback) {
  console.log('checking email address: ' + call.request.email);

  callback(null, { valid: true });
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  const server = new grpc.Server();
  server.addService(verification_proto.VerificationService.service, { isValidEmail });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();

    console.log('server listening on port 50051...')
  });
}

main();