# Monitoring as Code

Use the monaco tool to create the Management Zone _OpenTelemetry Demo_ in Dynatrace.

### Prerequisits

- Monaco tool installation: https://dynatrace-oss.github.io/dynatrace-monitoring-as-code/installation
- Dynatrace token with API v1 `Write Configuration` permission assigned

## Apply the Configuration

To apply the Management Zone configuration via Monaco, simply run the following command:

```bash
monaco deploy -e environments.yaml -s my-environment -p opentelemetry-demo
```

> Don't forget to navigate into the **monaco** directory.
>
> Please make sure that the environment variable `DT_API_TOKEN` is set with your token and available on the path.
