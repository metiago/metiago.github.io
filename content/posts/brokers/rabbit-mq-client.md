---
title: 'RabbitQM Client'
date: 2019-04-20T14:27:47-03:00
draft: false
---

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>org.example</groupId>
    <artifactId>rabbity</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>
    <dependencies>
        <dependency>
            <groupId>com.rabbitmq</groupId>
            <artifactId>amqp-client</artifactId>
            <version>5.20.0</version>
        </dependency>
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.6</version>
        </dependency>
    </dependencies>
</project>
```

```java
package org.example.queues;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class Publisher {

    public static final String QUEUE_NAME = "x-order-submitted";

    public static void main(String[] args) throws Exception {
        Publisher publisher = new Publisher();
        publisher.send();
    }

    private void send() throws Exception {

        String[] hosts = new String[]{"DOMAIN231"};

        for (String host : hosts) {

            InetAddress inetAddress = java.net.InetAddress.getByName(host);
            String address = inetAddress.getHostAddress();
            System.out.println(address);
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost(address);
            factory.setVirtualHost("/");
            factory.setUsername("user");
            factory.setPassword("pass");

            try (Connection connection = factory.newConnection();
                 Channel channel = connection.createChannel()) {

                String message = getPayload();
                channel.basicPublish(QUEUE_NAME, "", new AMQP.BasicProperties.Builder()
                        .headers(getAuthorization())
                        .build(), message.getBytes("UTF-8"));

                System.out.println(" [x] Sent ");
            }
        }
    }

    private String getPayload() throws Exception {
        var file = System.getProperty("user.dir") + "\\payloads\\orders\\payload.json";
        var json = FileUtils.readFileToString(new File(file), StandardCharsets.UTF_8);
        return json.replace("\n", "").replace("\r", "");
    }

    private Map<String, Object> getAuthorization() {
        Map<String, Object> headers = new HashMap<>();
        headers.put("Authorization", "xyz");
        return headers;
    }
}
```