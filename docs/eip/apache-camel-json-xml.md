---
title: 'Apache Camel JSON to XML'
date: 2018-03-25T19:18:41-03:00
draft: false
---

Converting payload from JSON to XML.

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

`data/inbox/message.json`

```json
{
  "note": {
    "to": "Francy",
    "from": "Tiago",
    "heading": "Reminder",
    "body": "See beyond!",
    "tags": ["love", "knowledge"]
  }
}
```

`JsonXML.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.model.dataformat.XmlJsonDataFormat;

import java.util.Arrays;

public class JsonXML {

    public static void main(String args[]) throws Exception {

        CamelContext context = new DefaultCamelContext();

        XmlJsonDataFormat xmlJsonFormat = new XmlJsonDataFormat();
        xmlJsonFormat.setRootName("reminders");
        xmlJsonFormat.setElementName("note");
        xmlJsonFormat.setExpandableProperties(Arrays.asList("tags", "tags"));

        context.addRoutes(new RouteBuilder() {

            public void configure() {

                from("file:data/inbox?noop=true&include=.*.json").to("direct:out");

                from("direct:out").unmarshal(xmlJsonFormat).log("Task Done: ${body}").to("file:data/outbox");
            }
        });

        context.start();
        Thread.sleep(10000);
        context.stop();
    }

}
```
