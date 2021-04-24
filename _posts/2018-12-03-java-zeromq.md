---
layout: post
title:  Java ZeroMQ Example
date:   2018-12-03 20:18:00 +0100
category: Dev
tags: zeomq java
---

## Java ZeroMQ Example

#### Concept

ZeroMQ is a high-performance asynchronous messaging library, aimed at use in distributed or concurrent applications. It provides a message queue, but unlike message-oriented middleware, a ZeroMQ system can run without a dedicated message broker.

#### Sample Code

pom.xml
```java
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>demo</artifactId>
  <name>ZeroMQ</name>
  <version>1.0.0-SNAPSHOT</version>
  
  <properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>    
    <dependency>
      <groupId>org.zeromq</groupId>
      <artifactId>jeromq</artifactId>
      <version>0.4.2</version>
    </dependency>
  </dependencies>
</project>
```

```java
package com.example.demo.rest;

import org.zeromq.ZMQ;
import org.zeromq.ZMQ.Context;
import org.zeromq.ZMQ.Socket;

public class CustomerSubscriber {

    public static void main(String[] args) {

        Context context = ZMQ.context(1);
        Socket subscriber = context.socket(ZMQ.SUB);
        subscriber.connect("tcp://localhost:5563");
        subscriber.subscribe("CUSTOMERS".getBytes());

        while (!Thread.currentThread().isInterrupted()) {
            // Read envelope with address
            String address = subscriber.recvStr();
            // Read message contents
            String contents = subscriber.recvStr();
            System.out.println(address + " : " + contents);
        }

        subscriber.close();
        context.term();
    }
}
```

```java
package com.example.demo.rest;

import org.zeromq.ZMQ;
import org.zeromq.ZMQ.Context;
import org.zeromq.ZMQ.Socket;

public class ProductSubscriber {

    public static void main(String[] args) throws InterruptedException {

        Context context = ZMQ.context(1);
        Socket subscriber = context.socket(ZMQ.SUB);
        subscriber.connect("tcp://localhost:5563");
        subscriber.subscribe("PRODUCTS".getBytes());

        while (!Thread.currentThread().isInterrupted()) {
            // Read envelope with address
            String address = subscriber.recvStr();
            // Read message contents
            String contents = subscriber.recvStr();
            System.out.println(address + " : " + contents);

            if(contents.startsWith("TV")) {
                System.out.println("Send again...");
                Publisher.send();
            }
        }

        subscriber.close();
        context.term();
    }
}
```

```java
package com.example.demo.rest;

import org.zeromq.ZMQ;
import org.zeromq.ZMQ.Context;
import org.zeromq.ZMQ.Socket;

public class Publisher {

    static Context context = ZMQ.context(1);
    static Socket publisher = context.socket(ZMQ.PUB);

    public static void main(String[] args) throws Exception {
        send();
    }

    public static void send() throws InterruptedException {
        publisher.bind("tcp://*:5563");
        Thread.sleep(1000);
        publisher.sendMore("CUSTOMERS");
        publisher.send("Customer created.");
        publisher.sendMore("PRODUCTS");
        publisher.send("TV");

//        publisher.close();
//        context.term();
    }
}
```
