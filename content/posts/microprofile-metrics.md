+++
title = ' Jakarta EE MicroProfile - Metrics'
date = 1500-05-22T19:18:41-03:00
draft = false
+++

MicroProfile is an initiative of Java community that brings the power of Java EE to the microservices world. You can learn more at <a href="https://microprofile.io/" target="_blank">https://microprofile.io/</a>. 

Collect metrics of an application in production is very easy with `MicroProfile - Metrics`, it exports metrics as prometheus data by default and contains a lot of necessary `JVM` information to analyze microservices behaviur on the cloud. 

The `prometheus.yml` file configures Prometheus to collect metrics from our app which can be analized in `Grafana`.


`prometheus.yml`

```yaml
global:
  scrape_interval:     15s

  external_labels:
    monitor: 'payara5-monitor'

scrape_configs:
  - job_name: 'payara5'
    scrape_interval: 2s
    metrics_path: '/metrics'
    static_configs:
      - targets: ['micro-metrics:8080']
```

`docker-compose.yml`

```yaml
version: '3'
services:
  prometheus:
     image: prom/prometheus
     container_name: prometheus
     restart: always
     ports:
      - "9090:9090"
     volumes:
      - ~/Desktop/metrics/prometheus.yml:/etc/prometheus/prometheus.yml
  micro-metrics:
     image: micro-metrics
     container_name: micro-metrics
     restart: always
     ports:
      - "8080:8080"
  grafana:
     image: grafana/grafana
     container_name: grafana
     restart: always
     ports:
      - "3000:3000
```

{{< figure src="/img/microprofile/metrics/graphana.png" width="auto" >}}

