+++
title = 'Zero MQ'
date = 2022-05-24T19:18:41-03:00
draft = false
+++

Zeromq is a message library that allow developers to design "brokerless" application. 

The official website can be found at https://zeromq.org/.

These samples was built with Jero MQ which is a  Java implementation of libzmq https://github.com/zeromq/jeromq.
 
`pom.xml`

```xml
<project  xmlns="http://maven.apache.org/POM/4.0.0"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.tiago</groupId>
    <artifactId>lollo</artifactId>
    <version>1.0-SNAPSHOT</version>
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>9</source>
                    <target>9</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <junit.version>5.6.0</junit.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.zeromq</groupId>
            <artifactId>jeromq</artifactId>
            <version>0.5.3</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```
#### Request Reply Pattern

It works like P2P communication allowing client to acknowledge message delivery. 

```java
import org.zeromq.SocketType;
import org.zeromq.ZContext;
import org.zeromq.ZMQ;

public class ServerRequestReply {

    public static void main(String[] args) {

        try (ZContext context = new ZContext()) {
            ZMQ.Socket socket = context.createSocket(SocketType.REP);
            socket.bind("tcp://*:5555");
            while (!Thread.currentThread().isInterrupted()) {
                byte[] reply = socket.recv(0); // block until a message is received
                System.out.println("Received: [" + new String(reply, ZMQ.CHARSET) + "]");
                String response = "Hello, world!";
                socket.send(response.getBytes(ZMQ.CHARSET), 0);
            }
        }
    }
}
```

```java
import org.zeromq.SocketType;
import org.zeromq.ZMQ;

public class ClientRequestReply {

    public static void main(String args[]) throws InterruptedException {
        try (ZMQ.Context context = ZMQ.context(1)) {
            ZMQ.Socket requester = context.socket(SocketType.REQ);
            requester.connect("tcp://localhost:5555");
            requester.send("Hello".getBytes(), 0);
            byte[] reply = requester.recv(0);
            String replyValue = new String(reply);
            System.out.println("Acknowledged...");
            requester.close();
            context.term();
        }
    }
}
```

#### Pub Sub Pattern

The publish-subscribe pattern is used for one-to-many distribution of data from a single publisher to multiple subscriber.

```java
package io.tiago.zero;

import org.zeromq.SocketType;
import org.zeromq.ZMQ;

public class ServerPubSubOne {

    public static void main(String[] args) throws InterruptedException {
        try (ZMQ.Context ctx = ZMQ.context(1)) {
            try (ZMQ.Socket sub = ctx.socket(SocketType.SUB)) {
                sub.connect("tcp://*:12345");
                sub.subscribe("B".getBytes());
                while (!Thread.currentThread().isInterrupted()) {
                    System.out.println("SUB: " + sub.recvStr());
                }
            }
        }
    }
}
```

```java
package io.tiago.zero;

import org.zeromq.SocketType;
import org.zeromq.ZMQ;

public class ServerPubSubTwo {

    public static void main(String[] args) throws InterruptedException {
        try (ZMQ.Context ctx = ZMQ.context(1)) {
            try (ZMQ.Socket sub = ctx.socket(SocketType.SUB)) {
                sub.connect("tcp://*:12345");
                sub.subscribe("A".getBytes());
                while (!Thread.currentThread().isInterrupted()) {
                    System.out.println("SUB: " + sub.recvStr());
                }
            }
        }
    }
}
```

```java
package io.tiago.zero;

import org.zeromq.SocketType;
import org.zeromq.ZMQ;

import java.util.Random;

public class ClientPubSub {

    public static void main(String[] args) throws InterruptedException {
        try (ZMQ.Context ctx = ZMQ.context(1)) {
            try (ZMQ.Socket pub = ctx.socket(SocketType.PUB)) {
                pub.bind("tcp://*:12345");
                Random rand = new Random(System.currentTimeMillis());
                while (!Thread.currentThread().isInterrupted()) {
                    String msg = String.format("%c-%05d", 'A' + rand.nextInt(10), rand.nextInt(100000));
                    System.out.println("Sending: " + msg);
                    pub.send(msg);
                    Thread.sleep(500);
                }
            }
        }
    }
}
```

### Reference
https://zeromq.org/socket-api/