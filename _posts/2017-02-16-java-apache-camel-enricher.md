---
layout: post
title: Java - Apache Camel Enricher
date: 2017-02-16 20:18:00 +0100
category: Dev
tags: apache-camel java
---



When sending messages from one system to another it is common for the target system to require more information than the source system can provide.
Incoming payload may just contain some information and before to save it to the database you require another important information and here is
where the enricher pattern comes to action.

For example, a system is processing a credit transaction to concede funds to given person but this transaction can only be acepted successuflly If this person
has a good score points at Experian, so enricher processor can call some Experian's endpoint, check or merge some data into the payload and then send
this payload to the next component on the Camel's route.

#### Example

Enrichers in Camel can be defined implementing the interface Processor,in view of it's a component which process a specific logic.

```java
import org.apache.camel.Exchange;
import org.apache.camel.Processor;

public class MyEnricher implements Processor {

    @Override
    public void process(Exchange exchange) throws Exception {
        exchange.getIn().getBody();
    }
}
```

This is the implementation of the router which call a RestFul API on each 3 seconds, unmarshal it and send the payload to our Enricher and log to the console.

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
