---
title: 'Apache Camel Load Balance'
date: 1500-02-25T19:18:41-03:00
draft: false
---

The Load Balancer Pattern allows you to delegate to one of a number of endpoints using a variety of different load balancing policies. 

To get know more about this pattern take look at [Camel Load Balance Pattern](https://camel.apache.org/components/latest/eips/loadBalance-eip.html)

### Example

At BMW I developed a backend robot using load balance with Camel which was very useful. We needed a robot to call periodically 3 different endpoints for
3 different insurance companies witout worryiing about order.

Round robin load balance works selecting messages in a round robin fashion. This is a well known and classic policy, which spreads the load evenly.

```java
import org.apache.camel.builder.RouteBuilder;

public class RoundRobinLoadBalance extends RouteBuilder {

    @Override
    public void configure() {
        from("timer:myTimer?period=3s")
                .loadBalance()
                .roundRobin()
                .to("direct:a")
                .to("direct:b")
                .to("direct:c");

        from("direct:a")
                .setBody()
                .constant("Endpoint Direct a")
                .to("stream:out");

        from("direct:b")
                .setBody()
                .constant("Endpoint Direct b")
                .to("stream:out");

        from("direct:c")
                .setBody()
                .constant("Endpoint Direct c")
                .to("stream:out");
    }
}
``` 

```java
import org.apache.camel.CamelContext;
import org.apache.camel.impl.DefaultCamelContext;

public class App {

    public static void main(String[] args) throws Exception {
        CamelContext context = new DefaultCamelContext();        
        context.disableJMX();        
        context.addRoutes(new RoundRobinLoadBalance());
        context.start();
        Thread.sleep(6000);
        context.stop();
    }
}
```
