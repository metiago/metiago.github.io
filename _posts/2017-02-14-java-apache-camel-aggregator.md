---
layout: post
title: Java - Apache Camel Aggregator
date: 2017-02-14 20:18:00 +0100
category: Dev
tags: apache camel java
---



The Aggregator from the EIP patterns allows you to combine a number of messages together into a single message.

#### Example

Save this CSV below as `animal.csv` in a directory called `data/inbox` in the root folder of your Java project.
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

Now we have the Camel route which reads the CSV file choosing only that one with CSV extensions. There're many important details in this snippet
using Camel's DSL. I suggest you to take a look at [Camel Documentation](https://camel.apache.org/components/latest/eips/aggregate-eip.html) 
which contains a rich explanation about each one.

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

Apache Camel has many built-in component to handle XML easily I would recommend to take a look at [Camel Documentation](https://camel.apache.org/docs/)
to get know more about its API.