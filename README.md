# Prometheus Importer Plugin

`prometheus-importer` is an IF plugin to import prometheus metrics like CPU or memory utilization into IF pipeline. This serves as an input for other calculation plugins for eg an energy calculation plugin.

## Implementation

This plugin calls [prometheus's range query api](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) under the hood.  
Api Signature:  
Request:  
POST /api/v1/query_range?query=&start=&end=&step=  
Response:  
```json
{
  "status": "success",
  "data": {
    "resultType": "matrix",
    "result": [
      {
        "metric": { "<label_name>": "<label_value>", ... },
        "values": [ [ <unix_time>, "<sample_value>" ], ... ]
      },
      ...
    ]
  }
}
```

The following parameters of this api are configurable via the global-config property in the manifest file: query, start, end, step. In addition to these, you need to specify
1. metric labels which need to be included in the output through metric-labels,
2. name of ouptut property to which you need the metric value mapped through metric-name and
3. key- value pairs which can be optionally added as default labels through default-labels

The plugin queries the prometheus server using the creds provided in .env file and values provided in global-config properties. It then parses the output and transforms it into a list of output params defined by properties provided in global-config

## Usage

### Prerequisites

[Setup a local prometheus server, redis and cadvisor](https://prometheus.io/docs/guides/cadvisor/)

### Example prometheus server credentials setup
configure host and auth credentials in the .env file as follows:
1. HOST property to configure host
2. USERNAME and PASSWORD properties to configure basic auth
3. BEARER_TOKEN property to configure bearer token auth

In our example, we need to only configure the HOST property as follows
```yaml
HOST=http://localhost:9090
```

### Example Manifest

```yaml
name: prometheus importer demo
description: simple demo invoking prometheus-importer plugin
initialize:
  plugins:
    prometheus-importer:
      method: PrometheusImporter
      path: 'https://github.com/Shivani-G/prometheus-importer'
      global-config:
        step: '1h'
        start: '2024-06-26T23:50:30.781Z'
        end: '2024-06-28T00:00:30.781Z'
        query: 'rate(container_cpu_usage_seconds_total{name="redis"}[1m])'
        metricLabels:
          - name
        metricName: 'cpu/utilization'
        defaultLabels:
          duration: 3600
          cloud/vendor: 'aws'
          cloud/instance-type: 't3.medium'
  outputs: 
    - yaml
tree:
  children:
    child:
      pipeline:
        - prometheus-importer
      inputs:
```

You can run this by passing it to `ie`. Run impact using the following command run from the project root:

```sh
npm i -g @grnsft/if
npm i -g https://github.com/Shivani-G/prometheus-importer
ie --manifest <path-to-your-manifest-file> --output <path-to-your-output-file>

```


This yields a result that looks like the following (saved to `<path-to-your-output-file>`):

```yaml
name: prometheus importer demo
description: simple demo invoking prometheus-importer plugin
tags:
initialize:
  plugins:
    prometheus-importer:
      path: https://github.com/Shivani-G/prometheus-importer
      method: PrometheusImporter
      global-config:
        step: 1h
        start: '2024-06-26T23:50:30.781Z'
        end: '2024-06-28T00:00:30.781Z'
        query: rate(container_cpu_usage_seconds_total{name="redis"}[1m])
        metricLabels:
          - name
        metricName: cpu/utilization
        defaultLabels:
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
  outputs: 
    - yaml
tree:
  children:
    child:
      pipeline:
        - prometheus-importer
      inputs: null
      outputs:
        - timestamp: 1719445830.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.0024794906509569277
        - timestamp: 1719449430.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.00244604159464335
        - timestamp: 1719453030.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.0018378176790554287
        - timestamp: 1719456630.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.002640314554501947
        - timestamp: 1719460230.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.0024358661173299154
        - timestamp: 1719463830.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.0024754247855137052
        - timestamp: 1719471030.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.0023651041996614166
        - timestamp: 1719492630.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.0009076525152132965
        - timestamp: 1719496230.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.0026441046008799122
        - timestamp: 1719521430.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.0026171076153025698
        - timestamp: 1719525030.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.002680664420188589
        - timestamp: 1719528630.781
          name: redis
          duration: 3600
          cloud/vendor: aws
          cloud/instance-type: t3.medium
          cpu/utilization: 0.0003523471077045494
```
