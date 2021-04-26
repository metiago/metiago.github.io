---
layout: post
title: Java - Apache Camel Translator
date: 2017-02-26 20:18:00 +0100
category: Dev
tags: apache camel java
---

#### Introduction

Translator is a pattern responsible to translate messages between different systems. Therefore If one system uses a CSV file to exchage information
and this application wants to communicate with an applaication that uses database to exchange information, translator could be used to transform
the data format between them.


#### Example

In this example we're going to see how to use Camel to read files from a directory, translate them based on its extension and then send them to 
[Active MQ](https://activemq.apache.org/).

Firs of all, spin up an Active MQ instance using this docker command below:

```bash
sudo docker run --name='activemq' -e ACTIVEMQ_ADMIN_LOGIN='admin' -e ACTIVEMQ_ADMIN_PASSWORD='12345678' -d --rm -P webcenter/activemq:latest
```

Create a directory called `/data/inbox` and add these two files below called `animals.csv` and `animals.xml` respectively.

```csv
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

You can take a look at http://127.0.0.1:8161/ to access Active MQ console and to see how many messages were enqueued.

This simple examples show a little bit about Translator which is an EIP as well as other important features of Apache Camel where
you can read more [here](https://camel.apache.org/components/latest/eips/enterprise-integration-patterns.html)