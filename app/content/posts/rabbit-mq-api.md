---
title: 'RabbitMQ API'
date: "2014-07-03"
draft: false
---

### Export Exchanges Config
```bash
curl --silent --user guest:guest --header "Content-type: application/json" http://127.0.0.1:15672/api/definitions -o queues.json
```

### Import Exchanges Config
```bash
curl --user guest:guest --data "@queues.json" --header "Content-Type: application/json" --request POST http://127.0.0.1:15672/api/definitions
```