+++
title = 'Apache Camel Interceptors'
date = 1500-02-13T19:18:41-03:00
draft = false
+++

This is an example of how to use interceptors in design. Interceptors are pretty useful to execute some logic before the target method execution. 

### Example

First of all, we have to create a folder called `data/inbox` in the project's root folder and then put those files below in it. 
These files would be our system integration messages.

`message1.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<person user="tiago">
  <firstName>Tiago</firstName>
  <lastName>Souza</lastName>
  <city>Florianopolis</city>
</person>
```

`message2.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<person user="ziggy">
  <firstName>Ziggy</firstName>
  <lastName>Zag</lastName>
  <city>Tampa</city>
</person>
```

Now, let's take a look on the code itself.

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
        
        <!-- LOGGING -->
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

`MyInterceptor.java`

```java

import org.apache.camel.CamelContext;
import org.apache.camel.Processor;
import org.apache.camel.model.ProcessorDefinition;
import org.apache.camel.processor.DelegateAsyncProcessor;
import org.apache.camel.spi.InterceptStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class MyInterceptor implements InterceptStrategy {

    private static final Logger LOG = LoggerFactory.getLogger(MyInterceptor.class);

    public Processor wrapProcessorInInterceptors(CamelContext context,
                                                 ProcessorDefinition<?> definition, final Processor target,
                                                 Processor nextTarget) throws Exception {

        return new DelegateAsyncProcessor(exchange -> {
            LOG.info("Before processor...");
            target.process(exchange);
            LOG.info("After processor...");
        });
    }
}
```

`MyRouteBuilder.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;

public class MyRouteBuilder {


    public static void main(String[] args) throws Exception {

        CamelContext context = new DefaultCamelContext();

        context.addRoutes(new RouteBuilder() {
            public void configure() {

                from("file:data/inbox?noop=true").
                        choice()
                        .when(xpath("/person/city = 'Florianopolis'"))
                        .to("file:data/outbox/br").
                        otherwise().to("file:data/outbox/us")
                        .end()
                        .addInterceptStrategy(new MyInterceptor());
            }
        });

        context.start();
        Thread.sleep(10000);
        context.stop();
    }
}
```
