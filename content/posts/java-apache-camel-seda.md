+++
title = 'Apache Camel Seda'
date = 1500-03-24T19:18:41-03:00
draft = false
+++


The staged event-driven architecture (SEDA) refers to an approach to software architecture that decomposes a complex, event-driven application into a set of stages connected by queues.

When using Apache Came to integrate services, it isn't uncommon to have a portion of route that take a long time to process. Rather than tying
up threads with long tasks consuming hours, it may be preferable to split out the time consuming step into a separate route, and let that stage of
processing be handled by a dedicated pool of threads.

### Example

`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.tiago.camel</groupId>
    <artifactId>design</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.target>1.8</maven.compiler.target>
        <maven.compiler.source>1.8</maven.compiler.source>
        <camel-version>2.20.0</camel-version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-core</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>1.7.30</version>
        </dependency>
    </dependencies>

</project>
```

`Main.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;

public class Main {

    public static void main(String args[]) throws Exception {

        CamelContext context = new DefaultCamelContext();

        context.addRoutes(new RouteBuilder() {
            public void configure() {

                from("timer:ping?period=200").to("seda:longTask");

                from("seda:longTask?concurrentConsumers=15")
                        .process(new LongRunningProcessor())
                        .to("direct:out");

                from("direct:out").log("Task Done: ${body}");
            }
        });

        context.start();
        Thread.sleep(10000);
        context.stop();
    }

}

class LongRunningProcessor implements Processor {

    @Override
    public void process(Exchange exchange) throws Exception {
        // EMULATE LONG RUNNING TASK
        Thread.sleep(30000);
    }
}
```

In the preceding example, a timer: endpoint is used to trigger messages on a regular basis, every 200 ms. The Timer Component uses one thread per timer. 
An event can only be raised 200 ms later if the thread is not processing the previous exchange.

As part of our integration, we want to trigger events regularly, and yet have a long-running processor as part of the route.

Camel allows us to deal with this scenario by splitting the long-running part into a shared route, and linking the two routes with a seda: endpoint.

When an exchange is passed to a seda: endpoint, it is placed into a BlockingQueue. The list exists within the Camel context, which means that only those routes that are within the same context can be joined by this type of endpoint.
