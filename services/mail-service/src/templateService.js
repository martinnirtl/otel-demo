const PROTO_PATH = __dirname + '/../protos/template-service.proto';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const { logger } = require('./logging');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const templateServiceProto = grpc.loadPackageDefinition(packageDefinition).templateservice;

logger.info('creating grpc-client...');
exports.client = new templateServiceProto.TemplateService(
  process.env.TEMPLATE_SERVICE_GRPC,
  grpc.credentials.createInsecure(),
);
