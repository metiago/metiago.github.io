---
title: 'Java Sockets'
date: "2016-02-08"
draft: false
image: "https://placehold.co/600x400"
---

Tool to check server's health `host:port` through TCP/IP.

### Example

`pom.xml`

```xml
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>io.tiago</groupId>
    <artifactId>monitor-server</artifactId>
    <version>1.0.0</version>

    <name>server</name>
    <description>Monitoring via TCP</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
        </dependency>
        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.17</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.6.0</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

`log4j.properties`

```xml
# Root logger option
log4j.rootLogger=DEBUG, stdout, file

# Redirect log messages to console
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.Target=System.out
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} %-5p %c{1}:%L - %m%n

# Redirect log messages to a log file, support file rolling.
log4j.appender.file=org.apache.log4j.RollingFileAppender
log4j.appender.file.File=log4j-application.log
log4j.appender.file.MaxFileSize=5MB
log4j.appender.file.MaxBackupIndex=10
log4j.appender.file.layout=org.apache.log4j.PatternLayout
log4j.appender.file.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} %-5p %c{1}:%L - %m%n
```

`Handler.java`

```java
package io.tiago.server;

import io.tiago.domain.Caller;
import org.apache.log4j.Logger;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketAddress;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;


public class Handler implements Runnable {

    private final static Logger LOGGER = Logger.getLogger(Handler.class.getName());

    private final static String MSG = "Service on %s:%s is up: %s";

    private Socket clientSocket;

    public Handler(Socket clientSocket) {
        this.clientSocket = clientSocket;
    }

    @Override
    public void run() {

        try {

            LOGGER.info("Start checking services...");
            PrintWriter out = new PrintWriter(clientSocket.getOutputStream());
            ObjectInputStream in = new ObjectInputStream(clientSocket.getInputStream());
            Caller c = (Caller) in.readObject();

            if (isScheduledRangeTime(c)) {

                TimeUnit.SECONDS.sleep(c.getPollFrequency());

                if(!givenService(c).isUp()) {
                    TimeUnit.MILLISECONDS.sleep(c.getExpire());
                }

                String message = String.format(MSG, c.getHost(), c.getPort(), c.isUp());

                out.write(message);
                out.flush();
                out.close();
                in.close();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Caller givenService(Caller caller) {
        try (Socket socket = new Socket()) {
            LOGGER.info(String.format("Checking host %s:%s...", caller.getHost(), caller.getPort()));
            SocketAddress socketAddress = new InetSocketAddress(caller.getHost(), caller.getPort());
            socket.connect(socketAddress);
            caller.setUp(true);
        } catch (IOException e) {
            caller.setUp(false);
        }
        return caller;
    }

    private boolean isScheduledRangeTime(Caller c) {
        LocalTime now = LocalTime.now();
        return now.isAfter(c.getStart()) && now.isBefore(c.getEnd());
    }
}
```

`Server.java`

```java
package io.tiago.server;

import org.apache.log4j.Logger;

import java.net.ServerSocket;
import java.net.Socket;


public class Server {

    private final static Logger LOGGER = Logger.getLogger(Server.class.getName());

    private final static int DEFAULT_SERVER_PORT = 6000;

    public static void main(String[] args) {
        Server s = new Server();
        s.start();
    }

    private void start() {

        LOGGER.info("Starting server.");

        try (ServerSocket serverSocket = new ServerSocket(DEFAULT_SERVER_PORT)) {

            while (!Thread.currentThread().isInterrupted()) {

                Socket clientSocket = serverSocket.accept();

                new Thread(new Handler(clientSocket)).start();
            }

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
    }
}
```

`Caller.java`

```java
package io.tiago.domain;

import java.io.Serializable;
import java.time.LocalTime;

public class Caller implements Serializable {

    private int pollFrequency;

    private LocalTime start;

    private LocalTime end;

    private long expire;

    private String host;

    private int port;

    private boolean up;

    public int getPollFrequency() {
        return pollFrequency;
    }

    public void setPollFrequency(int pollFrequency) {
        this.pollFrequency = pollFrequency;
    }

    public LocalTime getStart() {
        return start;
    }

    public void setStart(LocalTime start) {
        this.start = start;
    }

    public LocalTime getEnd() {
        return end;
    }

    public void setEnd(LocalTime end) {
        this.end = end;
    }

    public long getExpire() {
        return expire;
    }

    public void setExpire(long expire) {
        this.expire = expire;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public boolean isUp() {
        return up;
    }

    public void setUp(boolean up) {
        this.up = up;
    }
}
```

```java
package io.tiago.client;

import io.tiago.domain.Caller;
import org.apache.log4j.Logger;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.ObjectOutputStream;
import java.net.Socket;
import java.time.LocalTime;
import java.util.Scanner;

public class Client {

    private final static Logger LOGGER = Logger.getLogger(Client.class.getName());

    public static void main(String[] args) {

        Client client = new Client();

        System.out.print("Enter host ip: ");
        Scanner sc = new Scanner(System.in);
        String host = sc.nextLine();

        System.out.print("Enter port number: ");
        sc = new Scanner(System.in);
        int port = sc.nextInt();

        System.out.print("Enter poll frequency: ");
        sc = new Scanner(System.in);
        int pollFreq = sc.nextInt();

        System.out.print("Enter schedule start time (HH:mm): ");
        sc = new Scanner(System.in);
        LocalTime startTime = LocalTime.parse(sc.nextLine());

        System.out.print("Enter schedule end time (HH:mm): ");
        sc = new Scanner(System.in);
        LocalTime endTime = LocalTime.parse(sc.nextLine());

        System.out.print("Enter expiration time in milliseconds: ");
        sc = new Scanner(System.in);
        long expirationTime = sc.nextLong();

        Caller caller = new Caller();
        caller.setPollFrequency(pollFreq);
        caller.setStart(startTime);
        caller.setEnd(endTime);
        caller.setExpire(expirationTime);
        caller.setHost(host);
        caller.setPort(port);

        new Thread(() -> client.register(caller)).start();
    }

    private void register(Caller caller) {

        while (!Thread.currentThread().isInterrupted()) {

            try (Socket clientSocket = new Socket("127.0.0.1", 6000)) {

                ObjectOutputStream out = new ObjectOutputStream(clientSocket.getOutputStream());

                BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));

                out.writeObject(caller);
                String result = in.readLine();

                LOGGER.info(result);

                out.close();
                in.close();

            } catch (Exception e) {
                LOGGER.error(e.getMessage(), e);
            }
        }
    }
}
```

Once the `Server.java` is running we can run `Client.java` with the below input e:g.

```bash
Enter host ip: yahoo.com
Enter port number: 80
Enter poll frequency: 5
Enter schedule start time (HH:mm): 10:00
Enter schedule end time (HH:mm): 23:00
Enter expiration time in milliseconds: 5
```
