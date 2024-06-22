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

The plugin queries the prometheus server using the creds provided in __ and values provided in global-config properties. It then parses the output and transforms it into a list of output params defined by properties provided in global-config

## Usage

### Prerequisites

1. [Setup a local prometheus server](link)
2. [Setup a local k8s cluster][link]
3. [Setup cadvisor](link) to generate k8s metrics
4. Additionally, [setup kube-state-metrics](link) to get k8s objects state metrics

### Example prometheus server credentials setup

### Example Manifest

```yaml
name: prometheus importer demo
description: simple demo invoking prometheus-importer plugin
tags:
initialize:
  plugins:
    prometheus-importer:
      method: PrometheusImporter
      path: 'https://github.com/Shivani-G/prometheus-importer'
      global-config:
        query: 
        start: '-2d'
        end: '-1d'
        step: '1h'
        metric-labels:
          - cluster
        metric-name: cpu/utilization
        default-labels:
          - cloud/vendor: aws
          - cloud/instance-type: t3.medium
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
name: ccf-demo
description: example manifest invoking CCF plugin
initialize:
  plugins:
    ccf:
name: prometheus importer demo
description: simple demo invoking prometheus-importer plugin
tags:
initialize:
  plugins:
    prometheus-importer:
      method: PrometheusImporter
      path: 'https://github.com/Shivani-G/prometheus-importer'
      global-config:
        query: 
        start: '-2d'
        end: '-1d'
        step: '1h'
        metric-labels:
          - cluster
        metric-name: cpu/utilization
        default-labels:
          - cloud/vendor: aws
          - cloud/instance-type: t3.medium
  outputs: 
    - yaml
tree:
  children:
    child:
      pipeline:
        - prometheus-importer
      inputs: null
      outputs:
        - cluster: some-cluster
          timestamp: 1717848264.366
          cpu/utilization: 0
          cloud/vendor: aws
          cloud/instance-type: t3.medium
        - cluster: some-cluster
          timestamp: 1717851864.366
          cpu/utilization: 0
          cloud/vendor: aws
          cloud/instance-type: t3.medium
        - cluster: some-cluster
          timestamp: 1717855464.366
          cpu/utilization: 0
          cloud/vendor: aws
          cloud/instance-type: t3.medium
```
