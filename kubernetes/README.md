# Run Demo in Kubernetes

The following guide will help you run this demo project in Kubernetes. If you want to run it in Docker Compose, check out this [guide](https://github.com/martinnirtl/otel-demo/tree/master/compose).

### Prerequisits:

- Dynatrace Tenant or Environment (start your [free trial](https://www.dynatrace.com/trial/))
- A Kubernetes cluster (e.g. [AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/)) with [Dynatrace Operator](https://www.dynatrace.com/support/help/setup-and-configuration/setup-on-container-platforms/kubernetes/monitor-kubernetes-environments/) installed

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

- Load Generator: https://github.com/martinnirtl/otel-demo/blob/master/services/loadgen/Dockerfile
- Mail Service: https://github.com/martinnirtl/otel-demo/blob/master/services/mail-service/Dockerfile

## 2. Configure the Deployment

Before we can launch our demo, we will create the `otel` namespace and a Kubernetes secret which will allow the OpenTelemetry collector to ingest spans via the Dynatrace API. Copy the following command and replace `<TENANT-BASEURL>` and `<API-TOKEN>` before creating the secret by executing the command.

```bash
kubectl -n otel create secret generic otel-collector-secret --from-literal "OTEL_ENDPOINT_URL=<TENANT-BASEURL>/api/v2/otlp" --from-literal "OTEL_AUTH_HEADER=Api-Token <API-TOKEN>"
```

> Create a token via Access Tokens menu with **Ingest OpenTelemetry traces** and optionally **Write Configuration (API v1)** (if you want to run step 2.1) permissions assigned.

### 2.1 Create Management Zone via Monaco (optional)

If you want to create the Managment Zone `OpenTelemetry Demo` containing all entities of this demo, and get an introduction to the Monaco tool, check out this 5/10-minute guide [here](https://github.com/martinnirtl/otel-demo/tree/master/monaco).

## 3. Run the Demo

Before we start the demo services, let's deploy the OpenTelemetry collector. You can basically run the command from anywhere on your shell, but if you want to copy it, navigate into the **kubernetes** folder. Afterwards run the following command:

```bash
kubectl -n otel apply -f opentelemetry
```

You can verify the deployment by running the following command:

```bash
kubectl -n otel get all
```

Output:

```bash
NAME                                  READY   STATUS    RESTARTS   AGE
pod/otel-collector-57fdff48ff-xpzld   1/1     Running   0          10h

NAME                     TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)             AGE
service/otel-collector   ClusterIP   10.0.163.171   <none>        8888/TCP,4317/TCP   10h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/otel-collector   1/1     1            1           10h

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/otel-collector-57fdff48ff   1         1         1       10h
```

This will create some Kubernetes resources and deploy the OpenTelemetry collector as a Deployment.
Next, we can deploy the demo services in the `default` namespace:

```bash
kubectl apply -f services
```

Again, you can verify the deployment by running the following command:

```bash
kubectl get all
```

Output:

```bash
NAME                                    READY   STATUS    RESTARTS   AGE
pod/backend-64674d88db-6mds5            1/1     Running   0          10h
pod/loadgen-759f8999c5-tccqm            1/1     Running   0          10h
pod/mail-service-67d96955f-zcfk7        1/1     Running   0          10h
pod/mongo-5d5f76656-vpksg               1/1     Running   0          10h
pod/redis-5cdbbc6df6-nsr2w              1/1     Running   0          10h
pod/template-service-6864d4688f-lk4w8   1/1     Running   0          10h

NAME                       TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)     AGE
service/backend            ClusterIP   10.0.242.168   <none>        4000/TCP    10h
service/mail-service       ClusterIP   10.0.70.117    <none>        4100/TCP    10h
service/mongo              ClusterIP   10.0.41.223    <none>        27017/TCP   10h
service/redis              ClusterIP   10.0.144.135   <none>        6379/TCP    10h
service/template-service   ClusterIP   10.0.172.49    <none>        4200/TCP    10h

NAME                               READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend            1/1     1            1           10h
deployment.apps/loadgen            1/1     1            1           10h
deployment.apps/mail-service       1/1     1            1           10h
deployment.apps/mongo              1/1     1            1           10h
deployment.apps/redis              1/1     1            1           10h
deployment.apps/template-service   1/1     1            1           10h

NAME                                          DESIRED   CURRENT   READY   AGE
replicaset.apps/backend-64674d88db            1         1         1       10h
replicaset.apps/loadgen-759f8999c5            1         1         1       10h
replicaset.apps/mail-service-67d96955f        1         1         1       10h
replicaset.apps/mongo-5d5f76656               1         1         1       10h
replicaset.apps/redis-5cdbbc6df6              1         1         1       10h
replicaset.apps/template-service-6864d4688f   1         1         1       10h
```

## 4. Explore Data in Dynatrace

We will now visit our Backend Service in Dynatrace and check the distributed traces there.

> If you have set up the Management Zone, you can directly go to the services view and filter by the **OpenTelemtry Demo** Management Zone. Visit the Backend Service and check out a PurePath.

As our demo is now up and running, we want to check the data in Dynatrace. Let's visit the **Services** menu and filter for services running on our cluster. Select the Backend Service and visit the PurePaths view. Maybe you have to wait some minutes until you see some data.

Finally, select a transaction to see the PurePath enriched by OpenTelemetry spans and explore the e2e visibility and code-level insights made possible by the OpenTelemetry span ingest API.

> Please note: W3C trace context over gRPC is currently not supported by the OneAgent for NodeJS, which is why you won't get the full e2e visibility out of the box.
>
> Fortunately, we can make it work with OpenTelemetry - please reach out to [me](mailto:martin.nirtl@dynatrace.com) if you want to know how this can be done.

![Processes and Containers](https://raw.githubusercontent.com/martinnirtl/otel-demo/master/docs/img/dt-purepath.png)

### Having problems or facing issues?

Reach out to me via email: [martin.nirtl@dynatrace.com](mailto:martin.nirtl@dynatrace.com)
