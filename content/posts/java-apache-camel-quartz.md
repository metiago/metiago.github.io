+++

title = 'Apache Camel Quartz'
date = 1500-02-14T19:18:41-03:00

draft = false

+++

How to use <a href="http://www.quartz-scheduler.org/" blank="_blank">Quartz</a> in the routes.

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
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-quartz2</artifactId>
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

`QuartzTimer.java` is an example using a scheduler.

```java

import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;

public class QuartzTimer {

    public static void main(String[] args) throws Exception {

        CamelContext context = new DefaultCamelContext();

        context.addRoutes(new RouteBuilder() {
            public void configure() {

                from("quartz2://myTimer?trigger.repeatInterval=2000&trigger.repeatCount=-1")
                        .setBody().simple("Time at ${header.fireTime}")
                        .log("${body}").end();
            }
        });

        context.start();
        Thread.sleep(60000);
        context.stop();
    }
}
```

`QuartzCron.java` this is an example using cron.

```java
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;

public class QuartzCron {

    public static void main(String[] args) throws Exception {

        CamelContext context = new DefaultCamelContext();

        context.addRoutes(new RouteBuilder() {
            public void configure() {

                from("quartz2://report?cron=0/2+*+*+*+*+?")
                        .setBody().simple("Time at ${header.fireTime}")
                        .log("${body}").end();
            }
        });

        context.start();
        Thread.sleep(10000);
        context.stop();
    }
}
```
