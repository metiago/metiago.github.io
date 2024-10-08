---
title: 'Profiling Quarkus Application'
date: 2022-05-20T19:18:41-03:00
draft: false
---

**JConsole** is a graphical monitoring tool to monitor Java Virtual Machine and Java applications both on a local or remote machine.

This is how we can activate JMX to profile Quarkus applications.

```bash
mvn compile quarkus:dev -Dcom.sun.management.jmxremote \
-Dcom.sun.management.jmxremote.local.only=false -Djava.rmi.server.hostname=localhost
```

<img src="/site/images/jconsole/conn.png" width="auto" />

<img src="/site/images/jconsole/chart.png" width="auto" />
