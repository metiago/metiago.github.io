---
title: 'Apache Camel - Quick Reference'
date: "2014-07-03"
draft: false
image: "https://placehold.co/600x400"
---

- [Aggregators](#aggregators)
- [Enrichers](#enrichers)
- [Flat Files](#flat-files)
- [Filters](#filters)
- [FTP](#ftp)
- [Interceptors](#interceptors)
- [XML TO JSON](#xml-to-json)
- [JSON TO XML](#json-to-xml)
- [Load Balancer](#load-balancer)
- [Multicast](#multicast)
- [Quartz](#quartz)
- [SEDA](#seda)
- [Splitter](#splitter)
- [Throttler](#throttler)
- [Translator](#translator)
- [Wire Tap](#wire-tap)
- [XML](#xml)

Apache Camel is an open-source integration framework that facilitates the implementation of enterprise integration patterns (EIPs). It provides a consistent API for routing and transforming data between various systems, such as databases, message queues, and web services. Developers can define integration routes using a Domain-Specific Language (DSL) in Java, XML, or Groovy, making it easy to create complex workflows. Camel supports numerous protocols and data formats, enabling seamless communication across diverse environments. Its lightweight, modular architecture allows for embedding in applications or containers, making it a popular choice for microservices and service-oriented architectures (SOA).

### Aggregators

Aggregators allows you to combine a number of messages together into a single message.

#### Example

Save this data format as `animal.csv` in a directory called `data/inbox` in the root folder of your Java project.

```bash
28,Mustela nigripes,bad,Fran,2013-11-29
22,Spheniscus mendiculus,bad,Ziggy,2013-04-06
6,Diceros bicornis,good,Fran,2013-06-15
15,Lycaon pictus,good,Tiago,2013-01-02
15,Pongo pygmaeus,good,Be,2013-01-08
30,Panthera tigris tigris,good,Fran,2013-11-07
3,Pongo pygmaeus,good,Fran,2013-09-25
17,Lycaon pictus,bad,Ziggy,2013-07-08
13,Mustela nigripes,good,Fran,2013-12-18
13,Elephas maximus indicus,good,Ziggy,2013-05-27
16,Elephas maximus indicus,good,Be,2013-02-23
9,Lycaon pictus,bad,Tiago,2013-04-21
30,Lycaon pictus,good,Ziggy,2013-07-22
7,Ateles paniscus,good,John,2013-05-01
5,Gorilla beringei graueri,good,Ziggy,2013-10-28
```

Here is our Camel Aggregator with a simple implementation which combine messages in a new list.

```java
import org.apache.camel.Exchange;
import org.apache.camel.processor.aggregate.AggregationStrategy;

import java.util.ArrayList;
import java.util.List;

public class MyAggregator implements AggregationStrategy {

    private List<String> animals = new ArrayList<>();

    @Override
    public Exchange aggregate(Exchange oldExchange, Exchange newExchange) {

        if (oldExchange == null) {
            return newExchange;
        }

        String input = newExchange.getIn().getBody(String.class);
        animals.add(input);
        oldExchange.getIn().setBody(animals);

        return oldExchange;
    }
}
```

```java
import org.apache.camel.builder.RouteBuilder;

public class AggregatorRouter extends RouteBuilder {

    @Override
    public void configure() {

        from("file:data/inbox?noop=true&initialDelay=1000&delay=5000")
                .choice()
                .when().simple("${file:name} ends with 'csv'")
                .split(body().tokenize("\n"))
                .streaming()
                .aggregate(constant(true), new MyAggregator())
                .completionTimeout(5000)
                .end();
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
        context.addRoutes(new AggregatorRouter());
        context.start();
        Thread.sleep(6000);
        context.stop();
    }
}
```

### Enrichers

When sending messages from one system to another it is common for the 
target system to require more information than the source system can provide.

Incoming payload may just contain some information and before to save it in the database for example,
you might want another important information, and that is where the enricher pattern comes to action.

#### Example

A system is processing a credit transaction to concede funds to given person but this transaction can only be acepted successuflly If this person
has a good score points at Experian, so enricher processor can call some Experian's endpoint, check or merge some data into the payload and then send this payload to the next component on the Camel's route.

Enrichers in Camel can be defined implementing the interface `Processor`.

```java
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

public class MyEnricher implements Processor {

    @Override
    public void process(Exchange exchange) throws Exception {
        exchange.getIn().getBody(); // call a third-party API and "enrich" the exchange
    }
}
```

`EnricherRouter.java`

```java
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.model.dataformat.JsonLibrary;

public class EnricherRouter extends RouteBuilder {

    public static final String ENDPOINT = "https://jsonplaceholder.typicode.com/todos";

    @Override
    public void configure() throws Exception {
        from("timer:logMessageTimer?period=3s")
                .enrich(ENDPOINT, new MyEnricher())
                .unmarshal().json(JsonLibrary.Jackson)
                .process(new MyProcessor())
                .log("${body}");
    }
}
``` 

`App.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.impl.DefaultCamelContext;

public class App {

    public static void main(String[] args) throws Exception {
        CamelContext context = new DefaultCamelContext();        
        context.disableJMX();        
        context.addRoutes(new EnricherRouter());
        context.start();
        Thread.sleep(6000);
        context.stop();
    }
}
```

### Flat Files

Reading flat files with Camel. 

#### Example

```xml
<dependencies>
    <!-- Camel Dependencies -->
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-core</artifactId>
        <version>2.20.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-bindy</artifactId>
        <version>2.20.0</version>
    </dependency>
    <!-- FTP -->
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-ftp</artifactId>
        <version>2.20.0</version>
    </dependency>
    <dependency>
        <groupId>commons-io</groupId>
        <artifactId>commons-io</artifactId>
        <version>2.6</version>
    </dependency>
    <!--        JAVA 11+ REQ. -->
    <dependency>
        <groupId>javax.xml.bind</groupId>
        <artifactId>jaxb-api</artifactId>
        <version>2.3.0</version>
    </dependency>
    <dependency>
        <groupId>com.sun.xml.bind</groupId>
        <artifactId>jaxb-core</artifactId>
        <version>2.3.0</version>
    </dependency>
    <dependency>
        <groupId>com.sun.xml.bind</groupId>
        <artifactId>jaxb-impl</artifactId>
        <version>2.3.0</version>
    </dependency>
</dependencies>
```

Save this file below as `animal.txt` in a directory called `data/inbox` in the root folder of your Java project.

```txt
1011 20210423      
28   Pongo pygmaeus                     good      John                                               20130415
11   Pongo pygmaeus                     bad       Ziggy                                              20130424
04   Elephas maximus indicus            bad       Be                                                 20130324
15   Panthera pardus orientalis         good      Tiago                                              20130912
18   Lycaon pictus                      good      Tiago                                              20130220
25   Gorilla beringei graueri           bad       Tiago                                              20130730
17   Pongo pygmaeus                     bad       Be                                                 20130107
25   Lycaon pictus                      good      Be                                                 20130928
17   Panthera pardus orientalis         good      Tiago                                              20131213
25   Diceros bicornis                   bad       John                                               20130506
15   Spheniscus mendiculus              good      Ziggy                                              20130315
29   Elephas maximus indicus            good      John                                               20130912
23   Panthera tigris tigris             bad       Ziggy                                              20131209
12   Diceros bicornis                   good      Fran                                               20131230
3000123
```

`Animal.java`

```java
import org.apache.camel.dataformat.bindy.annotation.DataField;
import org.apache.camel.dataformat.bindy.annotation.FixedLengthRecord;

import java.io.Serializable;
import java.util.Date;

@FixedLengthRecord(ignoreTrailingChars=true, skipHeader = true, skipFooter = true)
public class Animal implements Serializable {

    private static final long serialVersionUID = 1L;

    @DataField(pos = 1, length = 2)
    private int id;

    @DataField(pos = 6, length = 32, trim = true)
    private String scientificName;

    @DataField(pos = 41, length = 4, trim = true)
    private String status;

    @DataField(pos = 51, length = 6, trim = true)
    private String veterinarian;

    @DataField(pos = 102, length = 8, pattern = "yyyyMMdd")
    private Date created;

    public Animal() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVeterinarian() {
        return veterinarian;
    }

    public void setVeterinarian(String veterinarian) {
        this.veterinarian = veterinarian;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    @Override
    public String toString() {
        return "Animal{" +
                "id=" + id +
                ", scientificName='" + scientificName + '\'' +
                ", status='" + status + '\'' +
                ", veterinarian='" + veterinarian + '\'' +
                ", created=" + created +
                '}';
    }
}
```

`FileRouter.java`

```java
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.dataformat.bindy.fixed.BindyFixedLengthDataFormat;

import java.util.Locale;

public class FileRouter extends RouteBuilder {

    @Override
    public void configure() throws Exception {

        BindyFixedLengthDataFormat bindy = new BindyFixedLengthDataFormat(Animal.class);

        bindy.setLocale(Locale.getDefault().getISO3Country());

        from("file:data/inbox?noop=true&initialDelay=1000&delay=5000")
                .choice()
                .when().simple("${file:name} ends with 'txt'")
                .unmarshal(bindy)
                .marshal(bindy)
                .to("file://data/outbox")
                .end();
    }

}
```

`App.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.impl.DefaultCamelContext;

public class App {

    public static void main(String[] args) throws Exception {
        CamelContext context = new DefaultCamelContext();        
        context.disableJMX();  // disable JMX to reduce some memory, sometimes useful in prd
        context.addRoutes(new FileRouter());
        context.start();
        Thread.sleep(6000);
        context.stop();
    }
}
```

### Filters

Filters checks an incoming message against a certain criteria that the message should adhere to.

#### Example

Save this file below as `animal.txt` in a directory called `data/inbox` in the root folder of your Java project.

```txt
1011 20210423      
28   Pongo pygmaeus                     good      John                                               20130415
11   Pongo pygmaeus                     bad       Ziggy                                              20130424
04   Elephas maximus indicus            bad       Be                                                 20130324
15   Panthera pardus orientalis         good      Tiago                                              20130912
18   Lycaon pictus                      good      Tiago                                              20130220
25   Gorilla beringei graueri           bad       Tiago                                              20130730
17   Pongo pygmaeus                     bad       Be                                                 20130107
25   Lycaon pictus                      good      Be                                                 20130928
17   Panthera pardus orientalis         good      Tiago                                              20131213
25   Diceros bicornis                   bad       John                                               20130506
15   Spheniscus mendiculus              good      Ziggy                                              20130315
29   Elephas maximus indicus            good      John                                               20130912
23   Panthera tigris tigris             bad       Ziggy                                              20131209
12   Diceros bicornis                   good      Fran                                               20131230
3000123
```

```java 
import org.apache.camel.dataformat.bindy.annotation.DataField;
import org.apache.camel.dataformat.bindy.annotation.FixedLengthRecord;

import java.io.Serializable;
import java.util.Date;

@FixedLengthRecord(ignoreTrailingChars=true, skipHeader = true, skipFooter = true)
public class Animal implements Serializable {

    private static final long serialVersionUID = 1L;

    @DataField(pos = 1, length = 2)
    private int id;

    @DataField(pos = 6, length = 32, trim = true)
    private String scientificName;

    @DataField(pos = 41, length = 4, trim = true)
    private String status;

    @DataField(pos = 51, length = 6, trim = true)
    private String veterinarian;

    @DataField(pos = 102, length = 8, pattern = "yyyyMMdd")
    private Date created;

    public Animal() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVeterinarian() {
        return veterinarian;
    }

    public void setVeterinarian(String veterinarian) {
        this.veterinarian = veterinarian;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    @Override
    public String toString() {
        return "Animal{" +
                "id=" + id +
                ", scientificName='" + scientificName + '\'' +
                ", status='" + status + '\'' +
                ", veterinarian='" + veterinarian + '\'' +
                ", created=" + created +
                '}';
    }
}

```

In the filter below we have a simple `if` statement which checks if the status of an animal is equal to "bad", therefore only these messages in the payload will be passed to the next Camel route.

```java
import io.tiago.files.Animal;
import org.apache.camel.Exchange;

public class MyFilter {

    public boolean checkHealth(Exchange exchange) {

        Animal animal = (Animal) exchange.getIn().getBody();

        if (animal.getStatus() != null && animal.getStatus().equalsIgnoreCase("bad")) {
            return true;
        }

        return false;
    }
}
``` 

This route reads a .txt file from `data/inbox` splitting the body and then applying a filter transfering to `data/outbox`

```java
import io.tiago.filters.MyFilter;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.dataformat.bindy.fixed.BindyFixedLengthDataFormat;

import java.util.Locale;

public class FileRouter extends RouteBuilder {

    private static final String INBOX = "file:data/inbox?noop=true&include=.*.txt";

    @Override
    public void configure() throws Exception {

        BindyFixedLengthDataFormat bindy = new BindyFixedLengthDataFormat(Animal.class);

        bindy.setLocale(Locale.getDefault().getISO3Country());

        from(INBOX)
                .unmarshal(bindy)
                .split()
                .body()
                .filter()
                .method(new MyFilter(), "checkHealth")
                .marshal(bindy)
                .to("file://data/outbox")
                .end();
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
        context.addRoutes(new FileRouter());
        context.start();
        Thread.sleep(6000);
        context.stop();
    }
}
```

### FTP

Fetching Apache Zookeeper from an FTP server to a folder in our local machine.

#### Example


```xml
<dependencies>
    <!-- Camel Dependencies -->
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-core</artifactId>
        <version>2.20.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-bindy</artifactId>
        <version>2.20.0</version>
    </dependency>
    <!-- FTP -->
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-ftp</artifactId>
        <version>2.20.0</version>
    </dependency>
    <dependency>
        <groupId>commons-io</groupId>
        <artifactId>commons-io</artifactId>
        <version>2.6</version>
    </dependency>
    <!--        JAVA 11+ REQ. -->
    <dependency>
        <groupId>javax.xml.bind</groupId>
        <artifactId>jaxb-api</artifactId>
        <version>2.3.0</version>
    </dependency>
    <dependency>
        <groupId>com.sun.xml.bind</groupId>
        <artifactId>jaxb-core</artifactId>
        <version>2.3.0</version>
    </dependency>
    <dependency>
        <groupId>com.sun.xml.bind</groupId>
        <artifactId>jaxb-impl</artifactId>
        <version>2.3.0</version>
    </dependency>
</dependencies>
```

`FtpRouter.java`

```java
import org.apache.camel.builder.RouteBuilder;

public class FtpRouter extends RouteBuilder {

    @Override
    public void configure() throws Exception {        
        from("ftp://ftp.unicamp.br/pub/apache/zookeeper/zookeeper-3.5.9")
        .to("file://data/outbox")
        .log("Getting FTP files..");
    }
}
```

`App.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.impl.DefaultCamelContext;

import io.tiago.ftp.FtpRouter;

public class App {

    public static void main(String[] args) throws Exception {
        CamelContext context = new DefaultCamelContext();
        context.disableJMX();
        context.setMessageHistory(true);
        context.addRoutes(new FtpRouter());
        context.start();
        Thread.sleep(60000);
        context.stop();
    }
}
```

### Interceptors

Interceptors are useful to execute some logic before the target method execution. 

#### Example

Create a folder named `data/inbox` in the project's root folder and save these files below as:

`message1.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<person user="tiago">
  <firstName>Tiago</firstName>
  <lastName>Souza</lastName>
  <city>POA</city>
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
                        .when(xpath("/person/city = 'POA'"))
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

### XML TO JSON

How to convert XML to JSON.

#### Example

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

`XMLJson.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;

public class XMLJson {

    public static void main(String args[]) throws Exception {

        CamelContext context = new DefaultCamelContext();

        context.addRoutes(new RouteBuilder() {
            public void configure() {

                from("file:data/inbox?noop=true&include=.*.xml").to("direct:out");

                from("direct:out").marshal().xmljson().log("Task Done: ${body}");
            }
        });

        context.start();
        Thread.sleep(10000);
        context.stop();
    }

}
```

### JSON TO XML

Converting payload from JSON to XML.

#### Example

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

### Load Balancer

The Load Balancer Pattern allows you to delegate to one of a number of endpoints using a variety of different load balancing policies. 

To get know more about this pattern take look at [Camel Load Balance Pattern](https://camel.apache.org/components/latest/eips/loadBalance-eip.html)

#### Example

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

### Multicast

It routes a message to a number of endpoints and process it differently.

#### Example

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

`MultiCast.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;

public class MultiCast {

    public static void main(String args[]) throws Exception {

        CamelContext context = new DefaultCamelContext();

        context.addRoutes(new RouteBuilder() {
            public void configure() {

                from("file:data/inbox?noop=true&include=.*.xml").multicast()
                        .to("direct:first")
                        .to("direct:second")
                        .to("direct:third")
                        .end();

                from("direct:first").marshal().xmljson().log("First Route: ${body}");

                from("direct:second").log("Second route: ${body}");

                from("direct:third").transform(simple("<test>${body}</test>")).log("Third Route: ${body}");
            }
        });

        context.start();
        Thread.sleep(10000);
        context.stop();
    }
}
```

### Quartz

Quartz is a richly featured and open source job scheduling library.

#### Example

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

### SEDA

The staged event-driven architecture (SEDA) refers to an approach to software architecture that decomposes a complex, event-driven application into a set of stages connected by queues.

When using Apache Came to integrate services, it's not uncommon to have a portion of route that take a long time to process. 
Rather than tying up threads with long tasks consuming hours, it may be preferable to split out the time consuming step into a separate route, and let that stage of processing be handled by a dedicated pool of threads.

#### Example

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

### Splitter

Splitter basically split a message into small pieces so that they can be processed individually.

#### Example

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

Running the app, it consumes messages from Kafka, convert them to a list of Notes and then split them out. 

> This pattern is very useful when we want to process data separately.

```bash
[read #1 - KafkaConsumer[camel]] route2                         INFO  Result: Note{to='Ziggy 0', from='Tiago 0', heading='Title 0', body='Content 0', tags=[tag0, tag1]}
[read #1 - KafkaConsumer[camel]] route2                         INFO  Result: Note{to='Ziggy 1', from='Tiago 1', heading='Title 1', body='Content 1', tags=[tag1, tag2]}
[read #1 - KafkaConsumer[camel]] route2                         INFO  Result: Note{to='Ziggy 2', from='Tiago 2', heading='Title 2', body='Content 2', tags=[tag2, tag3]}
[read #1 - KafkaConsumer[camel]] route2                         INFO  Result: Note{to='Ziggy 3', from='Tiago 3', heading='Title 3', body='Content 3', tags=[tag3, tag4]}
[read #1 - KafkaConsumer[camel]] route2                         INFO  Result: Note{to='Ziggy 4', from='Tiago 4', heading='Title 4', body='Content 4', tags=[tag4, tag5]}
```

### Throttler

Throttler limits the number of messages flowing through a route during a specified
time period. For intance, If you have a downstream system that can only handle 10 requests per second, 
using a throttler within your route can ensure that you do not exceed that rate.

#### Example

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
        <name>kind</name>
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

### Translator

Translator is a pattern responsible to translate messages between different systems. 
Therefore If one system uses a CSV file to exchage information and this application wants to communicate 
with an application that uses database to exchange information, translator could be used to transform the data format between them.


#### Example

In this example we're going to see how to use Camel to read files from a directory, translate them based on its extension and then send them to 
[Active MQ](https://activemq.apache.org/).

Firs of all, spin up Active MQ as below:

```bash
sudo docker run --name='activemq' -e ACTIVEMQ_ADMIN_LOGIN='admin' -e ACTIVEMQ_ADMIN_PASSWORD='12345678' -d --rm -P webcenter/activemq:latest
```

Create a directory called `/data/inbox` and add these two files below called `animals.csv` and `animals.xml` respectively.

```bash
28,Mustela nigripes,bad,Fran,2013-11-29
22,Spheniscus mendiculus,bad,Ziggy,2013-04-06
6,Diceros bicornis,good,Fran,2013-06-15
15,Lycaon pictus,good,Tiago,2013-01-02
15,Pongo pygmaeus,good,Be,2013-01-08
30,Panthera tigris tigris,good,Fran,2013-11-07
3,Pongo pygmaeus,good,Fran,2013-09-25
17,Lycaon pictus,bad,Ziggy,2013-07-08
13,Mustela nigripes,good,Fran,2013-12-18
13,Elephas maximus indicus,good,Ziggy,2013-05-27
16,Elephas maximus indicus,good,Be,2013-02-23
```

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<animals>
    <animal>
        <id>8</id>
        <scientificName>Spheniscus mendiculus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-07-28T17:48:00.618-03:00</created>
        <age>23</age>
    </animal>
    <animal>
        <id>4</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-07-08T14:35:20.362-03:00</created>
        <age>17</age>
    </animal>
    <animal>
        <id>5</id>
        <scientificName>Spheniscus mendiculus</scientificName>
        <status>good</status>
        <veterinarian>Be</veterinarian>
        <created>2013-06-23T07:53:29.411-03:00</created>
        <age>9</age>
    </animal>
    <animal>
        <id>9</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-09-25T09:01:33.181-03:00</created>
        <age>4</age>
    </animal>
    <animal>
        <id>6</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-07-09T03:45:11.726-03:00</created>
        <age>21</age>
    </animal>
</animals>
```

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
            <groupId>javax.annotation</groupId>
            <artifactId>javax.annotation-api</artifactId>
            <version>1.3.2</version>
        </dependency>
        <!-- Camel Dependencies -->
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-jackson</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-xstream</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-core</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-bindy</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-stream</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <!--CSV-->
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-csv</artifactId>
            <version>${camel-version}</version>
        </dependency>       
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-jaxb</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <!-- ACTIVEMQ -->
        <dependency>
            <groupId>org.apache.camel</groupId>
            <artifactId>camel-jms</artifactId>
            <version>${camel-version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.activemq</groupId>
            <artifactId>activemq-pool</artifactId>
            <version>5.6.0</version>
        </dependency>
        <dependency>
            <groupId>org.apache.activemq</groupId>
            <artifactId>activemq-camel</artifactId>
            <version>5.6.0</version>
        </dependency>
        <!-- logging -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>1.6.1</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>1.6.1</version>
        </dependency>
        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.16</version>
        </dependency>       
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.6</version>
        </dependency>
        <!--        JAVA 11+ REQ. -->
        <dependency>
            <groupId>javax.xml.bind</groupId>
            <artifactId>jaxb-api</artifactId>
            <version>2.3.0</version>
        </dependency>
        <dependency>
            <groupId>com.sun.xml.bind</groupId>
            <artifactId>jaxb-core</artifactId>
            <version>2.3.0</version>
        </dependency>
        <dependency>
            <groupId>com.sun.xml.bind</groupId>
            <artifactId>jaxb-impl</artifactId>
            <version>2.3.0</version>
        </dependency>
    </dependencies>

</project>

```

`CsvTranslator.java`

```java
package io.tiago.translators;

import org.apache.camel.Exchange;
import org.apache.camel.component.file.GenericFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class CsvTranslator {

    private final static Logger LOGGER = LoggerFactory.getLogger(CsvTranslator.class);

    public List<String> csvToList(Exchange exchange) throws Exception {

        List<String> lines = new ArrayList<>();

        GenericFile gfm = (GenericFile) exchange.getIn().getBody();

        String line = null;

        try (BufferedReader br = new BufferedReader(new FileReader((gfm.getAbsoluteFilePath())))) {
            while ((line = br.readLine()) != null) {
                lines.add(line.toUpperCase());
            }

        } catch (IOException e) {
            throw e;
        }

        return lines;
    }
}
```


`XmlTranslator.java`

```java
package io.tiago.translators;

import io.tiago.feed.Animal;
import io.tiago.feed.Animals;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.io.StringReader;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class XmlTranslator {

    public List<Animal> xmlToObject(String body) throws JAXBException {
        JAXBContext jaxbContext = JAXBContext.newInstance(Animals.class);
        Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
        StringReader reader = new StringReader(body);
        Animals animals = (Animals) unmarshaller.unmarshal(reader);
        return animals.getAnimals();
    }
}
```

This JMS router reads both files from `data/inbox` and route each one into a different channel applying a translator.

```java
import io.tiago.translators.CsvTranslator;
import io.tiago.translators.XmlTranslator;
import org.apache.camel.builder.RouteBuilder;

public class JmsRouter extends RouteBuilder {
    
    private static final String INBOX = "file:data/inbox?noop=true";

    @Override
    public void configure() throws Exception {

        from(INBOX).setHeader("ext", simple("file:name.ext"))
                .choice()
                .when(header("ext").isEqualTo("xml"))
                .to("direct:xml")
                .when(header("ext").isEqualTo("csv"))
                .to("direct:csv")
                .otherwise()
                .to("direct:c");

        from("direct:xml")
                .errorHandler(deadLetterChannel("direct:error")
                .maximumRedeliveries(2)
                .logHandled(true)
                .logExhaustedMessageHistory(true))
                .bean(new XmlTranslator(), "xmlToObject")
                .split(simple("body"))
                .log("Sending xml data to queue...")
                .inOnly("activemq:queue:queue.animal");

        from("direct:csv").errorHandler(defaultErrorHandler().maximumRedeliveries(3))
                .delay(500)
                .bean(new CsvTranslator(), "csvToList")
                .split(simple("body"))
                .log("Sending csv data to queue...")
                .to("activemq:queue:queue.animal");

        from("direct:c")
                .streamCaching()
                .log("Invalid file type");

        from("activemq:queue:queue.animal")
                .streamCaching()
                .to("stream:out");

        // THIS CHANNEL WILL ONLY RECEIVE THE PAYLOAD WHEN ALL ATTEMPTS OF REDELIVERY HAVE FAILED
        from("direct:error").log("exception.message").log("exception.stacktrace");
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
        context.addRoutes(new JmsRouter());
        context.start();
        Thread.sleep(6000);
        context.stop();
    }
}
```

You can take a look at http://127.0.0.1:8161/ to access Active MQ console and check out how many messages were enqueued.

### Wire Tap

When you want to process the current message in the background (concurrently) to the main route, 
without requiring a response, the Wire Tap EIP can help.

Typical use cases for this is logging the message to a backend system. The main thread of execution will continue to process the message through the current route as usual, while Wire Tap allows additional messaging processing to occur outside of the main route.

#### Example

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

### XML

How to integrate systems using Camel and XML.

#### Example

Save this XML below as `animal.xml` in a directory called `data/inbox` in the root folder of your Java project. This XML represents a list of
animals with some metadata.

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<animals>
    <animal>
        <id>8</id>
        <scientificName>Spheniscus mendiculus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-07-28T17:48:00.618-03:00</created>
        <age>23</age>
    </animal>
    <animal>
        <id>4</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-07-08T14:35:20.362-03:00</created>
        <age>17</age>
    </animal>
    <animal>
        <id>5</id>
        <scientificName>Spheniscus mendiculus</scientificName>
        <status>good</status>
        <veterinarian>Be</veterinarian>
        <created>2013-06-23T07:53:29.411-03:00</created>
        <age>9</age>
    </animal>
    <animal>
        <id>9</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-09-25T09:01:33.181-03:00</created>
        <age>4</age>
    </animal>
    <animal>
        <id>6</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-07-09T03:45:11.726-03:00</created>
        <age>21</age>
    </animal>
    <animal>
        <id>23</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-01-18T12:13:11.255-02:00</created>
        <age>8</age>
    </animal>
    <animal>
        <id>9</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>bad</status>
        <veterinarian>John</veterinarian>
        <created>2013-08-14T15:08:47.841-03:00</created>
        <age>2</age>
    </animal>
</animals>
```

Here we have our JAXB mapper classes representing the XML above:

```java
import java.io.Serializable;
import java.util.Date;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Animal implements Serializable {

    private static final long serialVersionUID = 1L;

    @XmlElement
    private int id;
    @XmlElement
    private String scientificName;
    @XmlElement
    private String status;
    @XmlElement
    private String veterinarian;
    @XmlElement
    private Date created;
    @XmlElement
    private int age;

    public Animal() {
    }

    public Animal(int id, String scientificName, String status, String veterinarian, Date created, int age) {
        this.id = id;
        this.scientificName = scientificName;
        this.status = status;
        this.veterinarian = veterinarian;
        this.created = created;
        this.age = age;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVeterinarian() {
        return veterinarian;
    }

    public void setVeterinarian(String veterinarian) {
        this.veterinarian = veterinarian;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

```java
import java.io.Serializable;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Animals implements Serializable{

    private static final long serialVersionUID = 1L;

    @XmlElement(name = "animal")
    private List<Animal> animals;

    public List<Animal> getAnimals() {
        return animals;
    }

    public void setAnimals(List<Animal> animals) {
        this.animals = animals;
    }
}
```

`XmlRouter.java`

```java
import org.apache.camel.builder.RouteBuilder;

public class XmlRouter extends RouteBuilder {

    JAXBContext context = JAXBContext.newInstance(new Class[]{io.tiago.feed.Animals.class});
    JaxbDataFormat xmlDataFormat = new JaxbDataFormat();
    xmlDataFormat.setContext(context);

    from(INBOX).doTry().unmarshal(xmlDataFormat)
            .split().tokenizeXML("status")
            .streaming() // process the payload in chunks
            .to("file://data/outbox")
            .end();
}
```

`App.java`

```java
import org.apache.camel.CamelContext;
import org.apache.camel.impl.DefaultCamelContext;

public class App {

    public static void main(String[] args) throws Exception {
        CamelContext context = new DefaultCamelContext();        
        context.disableJMX();        
        context.addRoutes(new XmlRouter());
        context.start();
        Thread.sleep(6000);
        context.stop();
    }
}
```
