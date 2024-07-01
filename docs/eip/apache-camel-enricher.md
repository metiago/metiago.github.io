---
title: 'Apache Camel Enricher'
date: 2018-02-24T19:18:41-03:00
draft: false
---

When sending messages from one system to another it is common for the 
target system to require more information than the source system can provide.

Incoming payload may just contain some information and before to save it in the database for example,
you might want another important information, and that is where the enricher pattern comes to action.

### Example

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
