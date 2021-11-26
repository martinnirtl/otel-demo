# Run Demo in Docker Compose

The following guide will help you run this demo project in Docker Compose. If you want to run it in Kubernetes, check out this [guide](https://github.com/martinnirtl/otel-demo/tree/master/kubernetes).

Prerequisits:

- Docker: https://docs.docker.com/get-docker
- Docker Compose: https://docs.docker.com/compose/install (usually comes with Docker Desktop)
- Dynatrace Tenant/Environment + API Token

> You can verify your docker(-compose) installation by running `docker ps` or `docker-compose ps`.

## 1. Dynatrace Configuration

In order to get the most out of this demo, we need to apply some settings to your Dynatrace environment.

### Enable W3C Trace Context

OpenTelemetry uses the [W3C Trace Context](https://www.w3.org/TR/trace-context) for context propagation. Please visit the settings under **Settings > Server-side service monitoring > Deep monitoring > Distributed tracing** and enable _Send W3C Trace Context HTTP headers_.

![Settings Distributed Tracing](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/settings-distributedtracing.png)

### Add Rule for Custom Process Monitoring

As all containers will run on the same (Docker) host, the OneAgent would naturally inject into all containers. Hence, we need to configure an exclusion rule to prevent the OneAgent from injecting into the Mail Service and the Load Generator.

> Remember: Mail Service will be completely instrumented with OpenTelemetry.

Go to **Settings > Processes and containers > Custom process monitoring rules** and setup the following rule:

COPY variable name from here: `DISABLE_DEEP_MONITORING`

![Settings Distributed Tracing](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/settings-customprocessmonitoringrules.png)

Both Mail Service and Load Generator have the respective variable set on the image at build-time:

- Mail Service: https://github.com/martinnirtl/otel-demo/blob/master/services/loadgen/Dockerfile
- Load Generator: https://github.com/martinnirtl/otel-demo/blob/master/services/mail-service/Dockerfile

## 2. Configure the Deployment

Before we can launch our container, we need to configure the following variables. You can simple copy the content from **.env-sample** or below and create a file named **.env** next to the **docker-compose.yaml** in this [directory](https://github.com/martinnirtl/otel-demo/tree/master/compose).

```env
OTEL_EXPORT_ENABLE=true
OTEL_ENDPOINT_URL=<TENANT URL>/api/v2/otlp
OTEL_AUTH_HEADER=<TENANT API TOKEN>

ONEAGENT_INSTALLER_SCRIPT_URL=<TENANT URL>/api/v1/deployment/installer/agent/unix/default/latest
ONEAGENT_INSTALLER_DOWNLOAD_TOKEN=<TENANT DEPLOYMENT TOKEN>

```

> You can also create only one token with _Ingest OpenTelemetry traces_ and _PaaS integration - Installer download_ permissions assigned.

## 3. Run the Demo

Finally, we can run the demo. If you inspect the _docker-compose.yaml_ in this directory, you will find a OneAgent service defined, as we are going to use a containerized agent for this tutorial. So let's start our lovely OneAgent with `docker-compose up -d oneagent`.

> Check out the [Dynatrace docs](https://www.dynatrace.com/support/help/setup-and-configuration/setup-on-container-platforms/docker/set-up-dynatrace-oneagent-as-docker-container/) if you want to learn more about running the OneAgent in Docker.

Next, we start Redis and Mongo DB via `docker compose up -d mongo redis`. The database will get initialized at the first startup. After some seconds you can check their status via `docker compose ps` and you should see both containers up and running:

![Settings Distributed Tracing](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/dockercompose-ps-redismongo.png)

Afterwards, we can run all other containers with `docker-compose up -d`. Again, we can check the status of all containers with `docker-compose ps`:

![Settings Distributed Tracing](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/dockercompose-ps-all.png)

## 4. Explore Data in Dynatrace

As our demo app is now up and running, we want to check the data in Dynatrace.
