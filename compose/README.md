# Run Demo in Docker Compose

The following guide will help you run this demo project in Docker Compose. If you want to run it in Kubernetes, check out this [guide](https://github.com/martinnirtl/otel-demo/tree/master/kubernetes).

Prerequisits:

- Linux or Windows host
- Docker: https://docs.docker.com/get-docker
- Docker Compose: https://docs.docker.com/compose/install (usually comes with Docker Desktop)
- Dynatrace Tenant or Environment

> You can verify your docker(-compose) installation by running `docker version` or `docker-compose version`.

## 1. Dynatrace Configuration

In order to get the most out of this demo, we need to apply some settings to your Dynatrace environment.

### Enable W3C Trace Context

OpenTelemetry uses the [W3C Trace Context](https://www.w3.org/TR/trace-context) for context propagation. Please visit the settings under **Settings > Server-side service monitoring > Deep monitoring > Distributed tracing** and enable _Send W3C Trace Context HTTP headers_.

![Settings Distributed Tracing](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/settings-distributedtracing.png)

### Add Rule for Custom Process Monitoring

As all containers will run on the same (Docker) host, the OneAgent would naturally inject into all containers. Hence, we need to configure an exclusion rule to prevent the OneAgent from injecting into the Mail Service and the Load Generator. Remember, the Mail Service will be completely instrumented with OpenTelemetry and the Load Generator just simulates traffic.

Go to **Settings > Processes and containers > Custom process monitoring rules** and setup the following rule:

> COPY variable name from here: `DISABLE_DEEP_MONITORING`

![Settings Distributed Tracing](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/settings-customprocessmonitoringrules.png)

Both Mail Service and Load Generator have the respective variable set on the image at build-time:

- Mail Service: https://github.com/martinnirtl/otel-demo/blob/master/services/loadgen/Dockerfile
- Load Generator: https://github.com/martinnirtl/otel-demo/blob/master/services/mail-service/Dockerfile

## 2. Configure the Deployment

Before we can launch our containers, we need to configure the following variables. You can simple copy the file **.env-sample** or copy the snippet from below and create a file named **.env** next to the **docker-compose.yaml** in this folder (compose dir).

```env
OS_TYPE=unix
DT_TENANT_BASEURL=
DT_TOKEN=
```

> `OS_TYPE` can be either _unix_ or _windows_.
>
> Create a token via Access Tokens menu with **Ingest OpenTelemetry traces** and **PaaS integration - Installer download** permissions assigned.

## 3. Run the Demo

Before we run some `docker-compose` commands, make sure you are in the **compose** folder or navigate into it via `cd compose`.

Finally, we can start with running the demo. If you inspect the [docker-compose.yaml](https://github.com/martinnirtl/otel-demo/blob/master/compose/docker-compose.yaml) in this directory, you will find a OneAgent service defined as we are going to use a containerized agent for this tutorial. So let's start our lovely OneAgent with `docker-compose up -d oneagent`.

> Check out the [Dynatrace docs](https://www.dynatrace.com/support/help/setup-and-configuration/setup-on-container-platforms/docker/set-up-dynatrace-oneagent-as-docker-container/) if you want to learn more about running the OneAgent in Docker.

Next, we start Redis and MongoDB via `docker compose up -d mongo redis`. The database will get initialized at the first startup. After some seconds you can check their status via `docker compose ps` and you should see our three containers up and running:

![Settings Distributed Tracing](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/dockercompose-ps-redismongo.png)

Afterwards, we can run all other containers with `docker-compose up -d`. Again, we can check the status of all containers with `docker-compose ps`:

![Settings Distributed Tracing](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/dockercompose-ps-all.png)

## 4. Explore Data in Dynatrace

As our demo is now up and running, we want to check the data in Dynatrace. Let's visit the **Hosts** menu and search for the host `OpenTelemetry Demo Host`. On the host details page, look for the Backend process (see first process in screenshot below):

![Processes and Containers](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/dt-processesandcontainers.png)

From the process, we can easily navigate to the Backend Service and visit the PurePaths view. Finally, select a transaction to see the PurePath enriched by OpenTelemetry spans and explore the e2e visibility and code-level insights made possible by the OpenTelemetry span ingest API.

![Processes and Containers](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/dt-purepath.png)

### Having problems or facing issues?

Reach out to me via email: [martin.nirtl@dynatrace.com](mailto:martin.nirtl@dynatrace.com)
