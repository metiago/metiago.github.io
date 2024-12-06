---
title: 'Profiling Quarkus Application'
date: "2021-01-08"
draft: false
image: "https://placehold.co/600x400"
---

**JConsole** is a graphical monitoring tool to monitor Java Virtual Machine and Java applications both on local or remote machine.

#### Activate JMX and profile Quarkus applications.

```bash
mvn compile quarkus:dev -Dcom.sun.management.jmxremote \
-Dcom.sun.management.jmxremote.local.only=false -Djava.rmi.server.hostname=localhost
```

![jconsole](/images/jconsole/conn.png)
---
![jconsole](/images/jconsole/chart.png)

