+++

title =  'Jakarta EE MicroProfile'
date = 1500-05-21T19:18:41-03:00

draft = false

+++

Eclipse MicroProfile is optimized for developers to build microservices and cloud-native applications using enterprise Java. Using the available APIs in MicroProfile, developers can easily build small and efficient microservices with the power of traditional Java EE frameworks.

This guide walks you through the process to create a microservice which returns data from an external API to simulate the interaction between two web services. 
It's important to note that this examples uses concepts of `Dependency Injection`, `Circuit Breaker`, `Inter Process Communication`.


### Example

`pom.xml` contains the dependecies for MicroProfile and the plugin to embed a Payara Server. Payara Server is an open-source application server derived from GlassFish Server Open Source Edition which is officially compatible with Jakarta EE and MicroProfile.. 

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
    http://maven.apache.org/xsd/maven-4.0.0.xsd" 
    xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <modelVersion>4.0.0</modelVersion>
  <groupId>io.tiago</groupId>
  <artifactId>starter</artifactId>
  <version>1.0-SNAPSHOT</version>
  <packaging>war</packaging>
  <properties>
    <maven.compiler.target>1.8</maven.compiler.target>
    <failOnMissingWebXml>false</failOnMissingWebXml>
    <maven.compiler.source>1.8</maven.compiler.source>
    <payaraVersion>5.194</payaraVersion>
    <final.name>starter</final.name>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.eclipse.microprofile</groupId>
      <artifactId>microprofile</artifactId>
      <version>3.2</version>
      <type>pom</type>
      <scope>provided</scope>
    </dependency>
  </dependencies>
  <build>
    <finalName>starter</finalName>
  </build>
  <profiles>
    <profile>
      <id>payara-micro</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <build>
        <plugins>
          <plugin>
            <groupId>fish.payara.maven.plugins</groupId>
            <artifactId>payara-micro-maven-plugin</artifactId>
            <version>1.0.5</version>
            <executions>
              <execution>
                <phase>package</phase>
                <goals>
                  <goal>bundle</goal>
                </goals>
              </execution>
            </executions>
            <configuration>
              <payaraVersion>${payaraVersion}</payaraVersion>
            </configuration>
          </plugin>
        </plugins>
      </build>
    </profile>
  </profiles>
</project>
```

`webapp/WEB-INF/beans.xml` This file is the bean archive descriptor for Context and Dependency Injection (CDI) applications. It can be used for any CDI compliant container in order to activate CDI feature. For version 1.0 of CDI, beans.xml is mandatory to enable CDI bean discovery. Without beans.xml, CDI is simply not active in the corresponding archive.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://xmlns.jcp.org/xml/ns/javaee"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee 
       http://xmlns.jcp.org/xml/ns/javaee/beans_1_1.xsd"
       bean-discovery-mode="all">
</beans>
```

`StarterRestApplication.java` defines the components of a JAX-RS application and supplies additional meta-data.

```java
package io.tiago.starter;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;


@ApplicationPath("/api")
@ApplicationScoped
public class StarterRestApplication extends Application {
}
```

`StarterController.java` this is the class which expose our endpoint to the web. The `@Inject` annotation define an injection point that is injected during bean instantiation. This is where `Dependency Injection` comes up.

```java
package io.tiago.starter.endpoints;

import io.tiago.starter.models.Dog;
import io.tiago.starter.services.DogService;

import java.util.List;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("/demo")
@ApplicationScoped
public class StarterController {

    @Inject
    private DogService dogService;
    
    @GET
    public List<Dog> checkTimeout() {
       return dogService.findAll();
    }
}
```

`DogService.java` this class represents our service layer, we have three important details here:

1. We are injecting (CDI) our Rest client on the `@RestClient` annotation so that we can call other web service.

2. The `@CircuitBreaker` annotation prevents repeated failures. If a service is failing frequently, the circuit breaker opens and no more calls to that service are attempted until a period of time has passed. `@Fallback` configures our fallback handler, when an exception is thrown the handler is called, both annotation combined create a fault tolerant service.

3. `JsonbBuilder.create()` comes from Java standard API `JSON-B` which is a standard binding layer for converting Java objects to/from JSON messages.

```java
package io.tiago.starter.services;



import java.util.Arrays;
import java.util.List;
import java.util.Random;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;
import javax.ws.rs.core.Response;

import io.tiago.starter.models.Dog;
import io.tiago.starter.ipc.DogServiceClient;
import org.eclipse.microprofile.faulttolerance.CircuitBreaker;
import org.eclipse.microprofile.faulttolerance.Fallback;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@RequestScoped
public class DogService {

    @Inject
    @RestClient
    private DogServiceClient client;

    @CircuitBreaker(failOn = ArithmeticException.class)
    @Fallback(DogListFallbackHandler.class)
    public List<Dog> findAll() {

        Dog[] data = null;
        int random = new Random().nextInt(10);

        if(random < 5) {
            Response resp = client.findAll();
            Jsonb jsonb = JsonbBuilder.create();
            data = jsonb.fromJson(resp.readEntity(String.class), 
            Dog[].class);
        }
        else {
            int r = 2 / 0;
        }        

        return Arrays.asList(data);
    }
}
```

`DogServiceClient.java` this class configures our Rest client so that we can handle `Inter Process Communication`. 

```java
package io.tiago.starter.ipc;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

@RegisterRestClient(baseUri = "http://vew9r.mocklab.io")
public interface DogServiceClient {

    @GET
    @Path("/dogs")
    Response findAll();
}
```

`DogListFallbackHandler.java` this is the fallback handler, If an error occurs, this will be teh default value returned in the API.

```java
package io.tiago.starter.services;

import java.util.Arrays;
import java.util.List;

import io.tiago.starter.models.Dog;
import org.eclipse.microprofile.faulttolerance.ExecutionContext;
import org.eclipse.microprofile.faulttolerance.FallbackHandler;

public class DogListFallbackHandler 
       implements FallbackHandler<List<Dog>> {

    @Override
    public List<Dog> handle(ExecutionContext executionContext) {

        Dog dog = new Dog();
        dog.name = "Josh";
        dog.age = 4;
        dog.gender = "Male";

        return Arrays.asList(dog);
    }
}
```

`Dog.java`

```java
package io.tiago.starter.models;

public class Dog {

    public String name;

    public int age;

    public String gender;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
```

Once we have our code in hands, we can build it and run it by follow up:

```bash
# Build
mvn clean package

# Start Emebed Payara Server
java -jar target/starter-microbundle.jar

# Call API
curl http://localhost:8080/api/demo
```

MicroProfile is a specification designed to optimizes the Enterprise Java for microservices architecture. 
The MicroProfile specification consists of a collection of Java EE APIs to build microservices that aims to deliver lightweight application to the cloud.
