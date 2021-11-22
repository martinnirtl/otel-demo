# OpenTelemetry and Dynatrace

Microservice-based demo project showcasing Dynatrace's tracing functionality in combination with OpenTelemetry.

![Architecture](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/architecture-diagram.png)

## The Showcase

The application itself does not really have a specific purpose nor it offers a UI. It just provides one endpoint for users to sign up with email, name and password and sends out a confirmation mail afterwards. All service communication is done via HTTP and gRPC.

While there are some surrounding services to make this a more representative example, the main components are the following:

1. Backend Service
2. Mail Service
3. Template Service

Backend Service and Template Service are going to be monitored via the OneAgent and will create some custom OpenTelemetry spans via manual instrumentation. The service in the middle - the Mail Service - is going to be instrumented with OpenTelemetry only.

The signup procedure can be described in 6 simple steps:

1. Signup-endpoint gets called with an HTTP-post call having email, name and password in the body
2. After email address validation, the user gets stored into the mongo database
3. Backend Service calls Mail Service's send-endpoint with an HTTP-post call
4. Mail Service calls Template Service with an HTTP-post call to retrieve the rendered email
5. After rendering the email, the Template Service stores the result in the Redis cache
6. Mail Service invokes an external mail-as-a-service provider

## Run the Demo

There are two ways to run this demo:

- [Docker Compose](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/run-docker-compose.md) - OneAgent will be deployed as Docker container
- [Kubernetes](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/run-kubernetes.md) - OneAgent deployment via Dynatrace Operator

## Get Hands-on Experience

## If you want to get some hands-on experience in instrumenting NodeJS apps, check out the [instrumentation tutorial](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/instrumentation-tutorial.md).

### Having problems or facing issues?

Reach out to me via email: [martin.nirtl@dynatrace.com](mailto:martin.nirtl@dynatrace.com)
