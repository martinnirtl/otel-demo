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

exports.client = new verification_proto.VerificationService(process.env.VERIFICATION_SERVICE_URL,  grpc.credentials.createInsecure());
