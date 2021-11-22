# OpenTelemetry and Dynatrace

Microservice-based demo project showcasing Dynatrace's tracing functionality in combination with OpenTelemetry.

![Architecture](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/architecture.png)

## The Showcase

The application itself does not really have a specific purpose nor it offers a UI. It just provides one endpoint for users to sign up with email, name and password and sends out a confirmation mail afterwards. All service communication is done via HTTP and gRPC.

While there are some surrounding services to make this a more representative example, the main components are the following:

1. Backend Service
2. Mail Service
3. Template Service

Backend Service and Template Service are going to be monitored via the OneAgent and will create some OpenTelemetry spans. The service in the middle - the Mail Service - is going to be instrumented with OpenTelemetry only.

---

## Run the Demo

There are two ways to easily run this demo:

- [Docker Compose](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/run-docker-compose.md)
- [Kubernetes](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/run-kubernetes.md)

---

## Get Hands-on Experience

## If you want to get some hands-on experience in instrumenting NodeJS apps, check out the [instrumentation tutorial](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/instrumentation-tutorial.md).

### Having problems or facing issues?

Reach out to me via email: [martin.nirtl@dynatrace.com](mailto:martin.nirtl@dynatrace.com)
