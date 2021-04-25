---
layout: post
title: Java - Apache Camel Filter
date: 2017-02-12 20:18:00 +0100
category: Dev
tags: apache camel java
---

#### Introduction

Filters checks an incoming message against a certain criteria that the message should adhere to.

Use a filter to remove unimportant data items from a message leaving only important items.

#### Example

This is the model which represents the file itself.

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
