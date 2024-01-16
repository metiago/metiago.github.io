+++
title = ' Zero MQ'
date = 1500-05-24T19:18:41-03:00
draft = true
+++

Zeromq is a message library that allow developers to design "brokerless" application. 
The official website can be found <a href="https://zeromq.org/" target="_blank"> here </a>.


These samples was built with Jero MQ which is a  Java implementation of libzmq. 
You can find more about it <a href="https://github.com/zeromq/jeromq" target="_blank"> here </a>.
 
pom.xml
```xml
<dependency>
    <groupId>org.zeromq</groupId>
    <artifactId>jeromq</artifactId>
    <version>0.5.3</version>
</dependency>
```
#### Request Reply Pattern

It works like P2P communication allowing client to acknowledge message delivery. 
More details can be found <a href="https://zeromq.org/socket-api/#request-reply-pattern" target="_blank"> here.</a>

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