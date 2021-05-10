---
layout: post
title: Java - SOAP WS
date: 2011-03-15 20:18:00 +0100
category: Dev
tags: java soap jaxws
---

The One-To-One mapping represents a single-valued association where an instance of one entity is associated with an instance of another entity.

#### Example

`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.tiago</groupId>
    <artifactId>soap-ws</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
    </properties>
    <dependencies>
        <dependency>
            <groupId>javax.xml.ws</groupId>
            <artifactId>jaxws-api</artifactId>
            <version>2.2</version>
        </dependency>
    </dependencies>
</project>
```

`HelloWorld.java`
```java
import javax.jws.WebMethod;
import javax.jws.WebService;
import javax.jws.soap.SOAPBinding;
import javax.jws.soap.SOAPBinding.Style;

@WebService
@SOAPBinding(style = Style.RPC)
public interface HelloWorld {

    @WebMethod
    String getHelloWorldAsString(String name);

}
```

`HelloWorldImpl.java`
```java
import javax.jws.WebService;

@WebService(endpointInterface = "com.tiago.soap.ws.HelloWorld")
public class HelloWorldImpl implements HelloWorld {

    @Override
    public String getHelloWorldAsString(String name) {
        return "Hello " + name;
    }
}
```

`EndPointServer.java`
```java
import com.tiago.soap.ws.HelloWorldImpl;
import javax.xml.ws.Endpoint;

public class EndPointServer {

    public static void main(String[] args) {
        Endpoint.publish("http://localhost:8082/ws/hello", new HelloWorldImpl());
    }
}
```

`WebServiceClient.java`
```java
import com.tiago.soap.ws.HelloWorld;
import java.net.MalformedURLException;
import java.net.URL;

import javax.xml.namespace.QName;
import javax.xml.ws.Service;

public class WebServiceClient {

    private static final String TARGET_NAMESPACE = "http://ws.soap.tiago.com/";
    private static final String SERVICE_NAME = "HelloWorldImplService";
    private static final String URL_WSDL = "http://localhost:8082/ws/hello?wsdl";

    public static void main(String[] args) throws MalformedURLException {

        QName qname = new QName(TARGET_NAMESPACE, SERVICE_NAME);

        URL url = new URL(URL_WSDL);

        Service service = Service.create(url, qname);
        
        HelloWorld helloWorld = service.getPort(HelloWorld.class);

        System.out.println(helloWorld.getHelloWorldAsString("Tiago"));
    }
}
```