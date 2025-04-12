---
title: 'Lambda & DynanoDB & Gateway'
date: "2014-07-03"
draft: false
---

Deploying AWS Lambda, API Gateway and DynanoDB using AWS Serverless Application Model(SAM).

`template.yaml`

```yaml
AWSTemplateFormatVersion: 2010-09-09
Transform: AWS::Serverless-2016-10-31
Description: CoolantLambdaJava

Globals:
  Function:
    Runtime: java8
    MemorySize: 512
    Timeout: 5
    Environment:
      Variables:
        COOLANT_TABLE: !Ref CoolantTemperatureSensor
  Api:
    OpenApiVersion: '3.0.1'

Resources:

  CoolantTemperatureSensor:
    Type: AWS::Serverless::SimpleTable
    Properties:
      PrimaryKey:
        Name: uid
        Type: String

  CoolantEventLambda:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: target/lambda.jar
      Handler: io.tiago.coolant.CoolantEventLambda::handler
      Policies:
        - DynamoDBCrudPolicy:
            TableName:
              !Ref CoolantTemperatureSensor
      Environment:
        Variables:
          ACCESS_KEY: 123A
          SECRET_KEY: X234
      Events:
        MyApi:
          Type: Api
          Properties:
            Path: /events
            Method: post

  CoolantQueryLambda:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: target/lambda.jar
      Handler: io.tiago.coolant.CoolantQueryLambda::handler
      Policies:
        - DynamoDBCrudPolicy:
            TableName:
              !Ref CoolantTemperatureSensor
      Environment:
        Variables:
          ACCESS_KEY: 123A
          SECRET_KEY: X234
      Events:
        MyApi:
          Type: Api
          Properties:
            Path: /events
            Method: get
```

pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>io.tiago</groupId>
  <artifactId>coolant</artifactId>
  <version>1.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
      <dependency>
        <groupId>com.amazonaws</groupId>
        <artifactId>aws-java-sdk-s3</artifactId>
        <version>1.11.873</version>
    </dependency>
    <dependency>
      <groupId>com.amazonaws</groupId>
      <artifactId>aws-java-sdk-dynamodb</artifactId>
      <version>1.11.873</version>
    </dependency>
    <dependency>
      <groupId>com.amazonaws</groupId>
      <artifactId>aws-lambda-java-events</artifactId>
      <version>2.2.6</version>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <artifactId>maven-shade-plugin</artifactId>
        <version>3.2.1</version>
        <executions>
          <execution>
            <phase>package</phase>
            <goals>
              <goal>shade</goal>
            </goals>
          </execution>
        </executions>
        <configuration>
          <finalName>lambda</finalName>
        </configuration>
      </plugin>
    </plugins>
  </build>

</project>
```

`ApiGatewayRequest.java`

```java
package io.tiago.coolant;

import java.util.HashMap;

import java.util.Map;

public class ApiGatewayRequest {
    public String body;
    public Map<String, String> queryStringParameters = new HashMap<>();
}
```

`ApiGatewayResponse.java`

```java
package io.tiago.coolant;

public class ApiGatewayResponse {

    public final int statusCode;

    public final String body;

    public ApiGatewayResponse(int statusCode, String body) {
        this.statusCode = statusCode;
        this.body = body;
    }
}
```

`CoolantEventLambda.java`

```java
package io.tiago.coolant;

import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.PutItemRequest;
import com.amazonaws.services.dynamodbv2.model.ReturnConsumedCapacity;
import com.amazonaws.services.dynamodbv2.model.ReturnValue;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class CoolantEventLambda {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String tableName = System.getenv("COOLANT_TABLE");

    public ApiGatewayResponse handler(ApiGatewayRequest request) throws IOException {

        final CoolantTemperatureSensor coolantTemperatureSensor = objectMapper.readValue(request.body, CoolantTemperatureSensor.class);

        PutItemRequest putItemRequest = new PutItemRequest();
        putItemRequest.setTableName(tableName);
        putItemRequest.setReturnConsumedCapacity(ReturnConsumedCapacity.TOTAL);
        putItemRequest.setReturnValues(ReturnValue.ALL_OLD);

        Map<String, AttributeValue> map = new HashMap<>();
        map.put("uid", new AttributeValue(UUID.randomUUID().toString()));
        map.put("timestamp", (new AttributeValue()).withN(String.valueOf(System.currentTimeMillis())));
        map.put("temperature", (new AttributeValue(coolantTemperatureSensor.getTemperature())));
        putItemRequest.setItem(map);

        DynamoDB.getConn().putItem(putItemRequest);

        return new ApiGatewayResponse(200, "OK");
    }
}
```

`CoolantQueryLambda.java`

```java
package io.tiago.coolant;

import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class CoolantQueryLambda {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String tableName = System.getenv("LOCATIONS_TABLE");

    private static final String DEFAULT_LIMIT = "50";

    public ApiGatewayResponse handler(ApiGatewayRequest request) throws IOException {

        final String limitParam = request.queryStringParameters == null ? DEFAULT_LIMIT : request.queryStringParameters.getOrDefault("limit", DEFAULT_LIMIT);

        final int limit = Integer.parseInt(limitParam);

        final ScanRequest scanRequest = new ScanRequest().withTableName(tableName).withLimit(limit);

        final ScanResult scanResult = DynamoDB.getConn().scan(scanRequest);

        final List<CoolantTemperatureSensor> events = scanResult.getItems().stream().map(item -> new CoolantTemperatureSensor(
                item.get("uid").getS(),
                Long.valueOf(item.get("timestamp").getN()),
                item.get("temperature").getS()
        )).collect(Collectors.toList());

        final String json = objectMapper.writeValueAsString(events);

        return new ApiGatewayResponse(200, json);
    }
}
```

`CoolantTemperatureSensor.java`

```java
package io.tiago.coolant;

public class CoolantTemperatureSensor {

    private String uid;

    private Long timestamp;

    private String temperature;

    public CoolantTemperatureSensor() {
    }

    public CoolantTemperatureSensor(String uid, Long timestamp, String temperature) {
        this.uid = uid;
        this.timestamp = timestamp;
        this.temperature = temperature;
    }

    public String getUid() {
        return uid;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public String getTemperature() {
        return temperature;
    }

    public void setTemperature(String temperature) {
        this.temperature = temperature;
    }
}
```

`DynamoDB.java`

```java
package io.tiago.coolant;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;

public class DynamoDB {

    public static AmazonDynamoDB getConn() {

        BasicAWSCredentials credentials = new BasicAWSCredentials(System.getenv("ACCESS_KEY"),
                                                                  System.getenv("SECRET_KEY"));

        return AmazonDynamoDBClientBuilder.standard()
                                          .withRegion(Regions.US_WEST_2)
                                          .withCredentials(new AWSStaticCredentialsProvider(credentials))
                                          .build();
    }
}
```
