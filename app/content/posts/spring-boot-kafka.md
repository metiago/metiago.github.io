---
title: 'A Step-by-Step Guide to Setting Up Multiple Spring Boot Applications with Kafka'
date: "2014-07-03"
draft: false
---

This guide will walk you through the process of setting up three Spring Boot applications that communicate with a Kafka message broker. 
In this example, we will have one producer that sends messages to Kafka and two consumers that read messages from different partitions.

`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.tiago</groupId>
	<artifactId>producer</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>producer</name>
	<description>Demo project for Spring Boot</description>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.0.6.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-webflux</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.kafka</groupId>
			<artifactId>spring-kafka</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>io.projectreactor</groupId>
			<artifactId>reactor-test</artifactId>
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

```java
server.port=5000
spring.kafka.producer.client-id=producer-1
spring.kafka.producer.retries=3
spring.kafka.producer.acks=1
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer
```

`KafkaSender.java`

```java
package com.tiago.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class KafkaSender {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public void send(String topic, String partition, String payload) {
        kafkaTemplate.send(topic, Integer.parseInt(partition), UUID.randomUUID().toString(), payload);
    }
}
```

`KafkaWebApi.java`

```java
package com.tiago.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class KafkaWebApi {


    @Autowired
    KafkaSender kafkaSender;

    @PostMapping("/kafka/{partition}/{topicName}")
    public String sendToTopic(@PathVariable String topicName,
                              @PathVariable String partition,
                              @RequestBody String message) {
        kafkaSender.send(topicName, partition, message);
        return "Message sent";
    }
}
```

`ProducerApp.java`

```java
package com.tiago.kafka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProducerApp {

    public static void main(String[] args) {
        SpringApplication.run(ProducerApp.class, args);
    }

}
```

That's it! Now let's set up our first consumer.

`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.tiago</groupId>
	<artifactId>consumer-one</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>consumer-one</name>
	<description>Demo project for Spring Boot</description>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.0.6.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-webflux</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.kafka</groupId>
			<artifactId>spring-kafka</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>io.projectreactor</groupId>
			<artifactId>reactor-test</artifactId>
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

```java
server.port=3000
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=souza
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=*
```

`KafkaReceiver.java`

```java
package com.tiago.kafka;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.TopicPartition;
import org.springframework.stereotype.Component;

@Component
public class KafkaReceiver {

    @KafkaListener(topicPartitions = @TopicPartition(topic = "souza", partitions = { "1" }))
    public void receiveTopic1(ConsumerRecord<?, ?> consumerRecord) {
        System.out.println("SERVICE 1 RECEIVE: " + consumerRecord.value());
    }
}
```

```java
package com.tiago.kafka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KafkaApplication {

    public static void main(String[] args) {
        SpringApplication.run(KafkaApplication.class, args);
    }

}
```

Finally, our second consumer.


`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<groupId>com.tiago</groupId>
	<artifactId>consumer-two</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>

	<name>consumer-two</name>
	<description>Demo project for Spring Boot</description>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.0.6.RELEASE</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
		<java.version>1.8</java.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-webflux</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.kafka</groupId>
			<artifactId>spring-kafka</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>io.projectreactor</groupId>
			<artifactId>reactor-test</artifactId>
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

```java
server.port=4000
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=souza
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=*
```

`KafkaReceiver.java`

```java
package com.tiago.kafka;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.TopicPartition;
import org.springframework.stereotype.Component;

@Component
public class KafkaReceiver {

    @KafkaListener(topicPartitions = @TopicPartition(topic = "souza", partitions = { "0" }))
    public void receiveTopic(ConsumerRecord<?, ?> consumerRecord) {
        System.out.println("SERVICE 2 RECEIVE: " + consumerRecord.value());
    }
}

```

`KafkaApplication.java`

```java
package com.tiago.kafka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KafkaApplication {

    public static void main(String[] args) {
        SpringApplication.run(KafkaApplication.class, args);
    }

}

```

### Testing

```bash
# Create a topic
bin/kafka-topics.sh --zookeeper 127.0.0.1:2181 --create --topic souza --partitions 10 --replication-factor 1

# Build project
mvn clean install

# Start Consumer 1
java -jar consumer-one/target/consumer-one-0.0.1-SNAPSHOT.jar

# Start Consumer 2
java -jar consumer-two/target/consumer-two-0.0.1-SNAPSHOT.jar

# Start Producer
# java -jar producer/target/producer-0.0.1-SNAPSHOT.jar

# Call API - http://localhost:5000/kafka/<partition>/<topic>
curl -d '{"Hello 2"}' -H 'Content-Type: application/json' http://localhost:5000/kafka/0/souza

# Call API - http://localhost:5000/kafka/<partition>/<topic>
curl -d '{"Hello 1"}' -H 'Content-Type: application/json' http://localhost:5000/kafka/1/souza
```
