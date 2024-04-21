---
title:  'Spring Boot Actuator'
date: 2019-05-08T19:18:41-03:00
draft: true
---

Spring Boot Actuator provide several features for monitoring and managing applications. 

It's very useful on pos-production phase when we have to manage and monitor applications, especially when working on a SOA ecosystem.

### Health Checking

Spring Actuator allow us to inspect our application where we can extract valuable information at runtime during the time it's running on production. It enables to fetch information like:

1. Make sure we have enough disk space to run your code.
1. Check if other services your application needs to access are accessible.
1. In case of new deployments, check that all the conditions for the requirement you implemented are in accordance.
1. Check if it is possible to access the database.

### Building the app

This is raw Spring Boot application that expose all `Actuator` endpoints.

`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
	https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.4.11</version>
		<relativePath/>
	</parent>
	<groupId>io.tiago</groupId>
	<artifactId>demo</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>demo</name>
	<description>Demo project for Spring Boot</description>
	<properties>
		<java.version>1.8</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-actuator</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

`application.properties`

```properties
# EXPOSE ALL ENDPOINTS
management.endpoints.web.exposure.include=*

# EXPOSE HEALTH DETAILS - when-authorized, always, never
management.endpoint.health.show-details=always

# EXPOSE SPECIFIC
# management.endpoints.web.exposure.include=beans, loggers

# EXPOSE ALL EXCEPT ONE
# management.endpoints.web.exposure.exclude=threaddump

# ENABLE SHUTDOWN
management.endpoint.shutdown.enabled=true
```

`DemoApplication.java`

```java
package io.tiago.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
```

`FileHealth.java`

We can use Spring Beans to create custom Health Indicator. This is an example that checks If a file exists on the disk.

```java
package io.tiago.demo;

import java.io.File;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class FileHealth implements HealthIndicator {

    @Override
    public Health health() {

        File file = new File(System.getProperty("user.home") + "/config.properties");

        if (file.exists()) {
            return Health.up().build();
        }

        return Health.down().withDetail("reason", "File [" + file.getAbsolutePath() + "] not found.").build();
    }

}
```

### HTTP Samples

```bash
# The list with all endpoints can be found when calling
curl http://localhost:8080/actuator
```

```bash
# Shutdown our application can be done by calling:
curl -X POST http://localhost:8080/actuator/shutdown
```
