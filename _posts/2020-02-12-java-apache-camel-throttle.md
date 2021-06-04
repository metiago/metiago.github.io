---
layout: post
title: Java - Apache Camel Throttler
date: 2020-02-12 20:18:00 +0100
category: Dev
tags: apache-camel java
---

When you need to limit the number of messages flowing through a route during a specified
time period, we can use Throttler EIP. If you have a downstream system that can only handle 10 requests per second, 
using a Throttler within your route can ensure that you do not exceed that rate.

#### Example

`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.tiago.camel</groupId>
    <artifactId>apache-camel</artifactId>
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

`ThrottleXMLJson.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;

public class ThrottleXMLJson {

    public static void main(String args[]) throws Exception {

        CamelContext context = new DefaultCamelContext();

        context.addRoutes(new RouteBuilder() {

            public void configure() {

                from("file:data/inbox?noop=true&include=.*.xml").throttle(5)
                .timePeriodMillis(2000) // every 2 seconds the Throttler will allow up to 5 messages to be processed.
                .to("direct:first").end();

                from("direct:first").marshal().xmljson().log("First Route: ${body}");
            }
        });

        context.start();
        Thread.sleep(10000);
        context.stop();
    }

}

```