---
layout: post
title: Java - Apache Camel XML
date: 2017-02-12 20:18:00 +0100
category: Dev
tags: apache camel java
---



When working with heterogeneous systems sometimes we need to integrate them using an XML file.
Today we are going to implement a simple how-to, using Camel XML features to read a XML file from one directory and save it in another one.

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

Here we have our JAXB mapped classes representing the XML above:

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


This is the Camel implementation which reads XML file from inbox directory, process it and save it in the outbox directory.

Notice the `.streaming()` method which splits payload in streaming mode which means it will split the input message in chunks.

```java
import org.apache.camel.builder.RouteBuilder;

public class XmlRouter extends RouteBuilder {

    JAXBContext context = JAXBContext.newInstance(new Class[]{io.tiago.feed.Animals.class});
    JaxbDataFormat xmlDataFormat = new JaxbDataFormat();
    xmlDataFormat.setContext(context);

    from(INBOX).doTry().unmarshal(xmlDataFormat)
            .split().tokenizeXML("status")
            .streaming()
            .to("file://data/outbox")
            .end();
}
```

Finally our main method which tells Camel to follow its route.

One points to mention here is `context.disableJMX();` this method when called, disable JMX which reduces memory, If you need to monitor your application
you then can ignore it.

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

Apache Camel has many built-in component to handle XML easily I would recommend to take a look at [Camel Documentation](https://camel.apache.org/docs/)
to get know more about its API.