+++

title = 'Apache Camel Kafka & Split'
date = 1500-03-23T19:18:41-03:00

draft = false


+++

This guide walks you through the process of using design to build an application that reads data from Kafka, split it and log its output.
Splitter basically split a message into small pieces so that they can be processed individually.
You can read more about the Splitter [here](https://camel.apache.org/components/latest/eips/split-eip.html).


### Example

Once you have Kafka running, we you can start coding this sample. There is an example of how to set up Kafka single node right [here](https://metiago.github.io/2019/06/22/kafka-single-node.html?query=kafka).

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
        <camel-version>2.25.4</camel-version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-core</artifactId>
            <version>${camel-version}</version>
        </dependency>     
         <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-xstream</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-jackson</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-kafka</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>1.7.30</version>
        </dependency>     
    </dependencies>

    <build>

    <plugins>
    <plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.2.1</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
                <shadedArtifactAttached>true</shadedArtifactAttached>
                <shadedClassifierName>executable-jar</shadedClassifierName>
                <transformers>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                        <mainClass>examples.Splitter</mainClass>
                    </transformer>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.AppendingTransformer">
                        <resource>META-INF/services/org/apache/camel/TypeConverterLoader</resource>
                    </transformer>
                </transformers>
            </configuration>
        </execution>
    </executions>
        </plugin>
    </plugins>
</build>
</project>
```

`Note.java`

```java
package model;

import java.util.List;

public class Note {

    private String to;

    private String from;

    private String heading;

    private String body;

    private List<String> tags;

    public Note() {
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getHeading() {
        return heading;
    }

    public void setHeading(String heading) {
        this.heading = heading;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.
    }

    @Override
    public String toString() {
        return "Note{" +
                "to='" + to + '\'' +
                ", from='" + from + '\'' +
                ", heading='" + heading + '\'' +
                ", body='" + body + '\'' +
                ", tags=" + tags +
                '}';
    }
}
```

`JsonConverter.java` is a processor which allow us to convert the input message coming from Kafka to our custom Object.

```java
class JsonConverter implements Processor {

    public void process(Exchange exchange) throws IOException {
        Note[] note = new ObjectMapper().readValue((String) exchange.getIn().getBody(), Note[].class);
        exchange.getIn().setBody(note);
    }
}
```

`Splitter.java`

```java
package examples;

import com.fasterxml.jackson.databind.ObjectMapper;
import model.Note;
import org.apache.camel.CamelContext;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.component.kafka.KafkaComponent;
import org.apache.camel.component.kafka.KafkaConstants;
import org.apache.camel.impl.DefaultCamelContext;

import java.io.IOException;
import java.util.*;

public class Splitter {

    public static void main(String[] args) throws Exception {

        CamelContext context = new DefaultCamelContext();

        KafkaComponent kafka = new KafkaComponent();
        kafka.setBrokers("localhost:9092");
        context.addComponent("kafka", kafka);

        context.addRoutes(new RouteBuilder() {

            public void configure() {

                from("kafka:camel").process(new JsonConverter()).split(body()).to("direct:out");

                from("direct:out").log("Result: ${body}").end();
            }
        });


        ProducerTemplate producerTemplate = context.createProducerTemplate();

        context.start();

        Map<String, Object> headers = new HashMap<>();
        headers.put(KafkaConstants.KEY, "1"); // Required The key of the message in order to ensure that all related message goes in the same partition
        headers.put(KafkaConstants.TOPIC, "camel"); // The topic to which send the message (override and takes precedence), and the header is not preserved.

        List<Note> notes = new ArrayList<>();

        for (int i = 0; i < 20; i++) {

            Note note = new Note();
            note.setFrom("Tiago " + i);
            note.setTo("Ziggy " + i);
            note.setHeading("Title " + i);
            note.setBody("Content " + i);
            note.setTags(Arrays.asList("tag" + i, "tag" + (i + 1)));

            notes.add(note);
        }

        String s = new ObjectMapper().writeValueAsString(notes);
        producerTemplate.sendBodyAndHeaders("kafka:camel", s, headers);

        Thread.sleep(360 * 1000);

        context.stop();
    }
}
```

Once we execute our application, it consumes messages from Kafka, convert it to a list of Notes and then split them. 
You shoud have an output similiar to that one below, which demonstrate 5 object splitted out of the array that comes from Kafka.

This pattern is pretty useful when we want to process data separately.

```bash
[read #1 - KafkaConsumer[camel]] route2                         INFO  Result: Note{to='Ziggy 0', from='Tiago 0', heading='Title 0', body='Content 0', tags=[tag0, tag1]}
[read #1 - KafkaConsumer[camel]] route2                         INFO  Result: Note{to='Ziggy 1', from='Tiago 1', heading='Title 1', body='Content 1', tags=[tag1, tag2]}
[read #1 - KafkaConsumer[camel]] route2                         INFO  Result: Note{to='Ziggy 2', from='Tiago 2', heading='Title 2', body='Content 2', tags=[tag2, tag3]}
[read #1 - KafkaConsumer[camel]] route2                         INFO  Result: Note{to='Ziggy 3', from='Tiago 3', heading='Title 3', body='Content 3', tags=[tag3, tag4]}
[read #1 - KafkaConsumer[camel]] route2                         INFO  Result: Note{to='Ziggy 4', from='Tiago 4', heading='Title 4', body='Content 4', tags=[tag4, tag5]}
```
