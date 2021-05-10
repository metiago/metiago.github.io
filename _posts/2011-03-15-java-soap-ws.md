---
layout: post
title: Java - SOAP WS
date: 2011-03-15 20:18:00 +0100
category: Dev
tags: java soap jaxws
---

JAX-WS is a technology for building web services and clients that communicate using XML. JAX-WS allows developers to write message-oriented as well as Remote Procedure Call-oriented (RPC-oriented) web services.

In JAX-WS, a web service operation invocation is represented by an XML-based protocol, such as SOAP. The SOAP specification defines the envelope structure, encoding rules, and conventions for representing web service invocations and responses. These calls and responses are transmitted as SOAP messages (XML files) over HTTP.

Although SOAP messages are complex, the JAX-WS API hides this complexity from the application developer. On the server side, the developer specifies the web service operations by defining methods in an interface written in the Java programming language. The developer also codes one or more classes that implement those methods. Client programs are also easy to code. A client creates a proxy (a local object representing the service) and then simply invokes methods on the proxy. With JAX-WS, the developer does not generate or parse SOAP messages. It is the JAX-WS runtime system that converts the API calls and responses to and from SOAP messages.

With JAX-WS, clients and web services have a big advantage: the platform independence of the Java programming language. In addition, JAX-WS is not restrictive: A JAX-WS client can access a web service that is not running on the Java platform, and vice versa. This flexibility is possible because JAX-WS uses technologies defined by the W3C: HTTP, SOAP, and WSDL. WSDL specifies an XML format for describing a service as a set of endpoints operating on messages.

#### Example

This is a demonstration of how JAX-WS basically works.

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