+++

title = 'Apache Camel Wire Tap'
date = 1500-03-27T19:18:41-03:00

draft = false


+++

When you want to process the current message in the background (concurrently) to the main route, without requiring a response, the Wire Tap EIP can help. 

Typical use cases for this is logging the message to a backend system. The main thread of execution will continue to process the message through the current route as usual, while Wire Tap allows additional messaging processing to occur outside of the main route.

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
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-xmljson</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>1.7.30</version>
        </dependency>
        <dependency>
            <groupId>xom</groupId>
            <artifactId>xom</artifactId>
            <version>1.3.7</version>
        </dependency>
    </dependencies>
</project>
```

`data/inbox/message.xml`

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<note>
    <to>Francy</to>
    <from>Jani</from>
    <heading>Reminder</heading>
    <body>See beyond!</body>
    <tags>
        <name>light</name>
        <name>love</name>
    </tags>
</note>
```

`WireTap.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;

public class WireTap {

    public static void main(String args[]) throws Exception {

        CamelContext context = new DefaultCamelContext();

        context.addRoutes(new RouteBuilder() {
            public void configure() {

                from("file:data/inbox?noop=true&include=.*.xml").wireTap("direct:tap").to("direct:out");

                from("direct:out").marshal().xmljson().log("Task Done: ${body}");

                from("direct:tap").log("wire tap route: ${body}");
            }
        });

        context.start();
        Thread.sleep(10000);
        context.stop();
    }
}
```
