+++

title =  'JVM Profiling'
date = 1500-05-20T19:18:41-03:00

draft = false


+++

### Visual VM
```bash
# open up visual vm 
visualvm --jdkhome "/Home/OpenJDK/jdk-11.0.16.8-hotspot"
```

### JConsole - Quarkus

```bash
mvn compile quarkus:dev -Dcom.sun.management.jmxremote \
-Dcom.sun.management.jmxremote.local.only=false -Djava.rmi.server.hostname=localhost
```

<img src="{{site.github.url}}/assets/img/jconsole/chart.png" width="100%" height="100%"/>


