---
title:  'AWS QLDB & Lambda'
date: "2014-07-03"
draft: false
---

Java `FaaS` sample to perform actions in AWS QLDB.

`pom.xml`

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ctw.consent</groupId>
    <artifactId>customer</artifactId>
    <version>0.1.0</version>
    <packaging>jar</packaging>

    <parent>
        <artifactId>dcm-qldb</artifactId>
        <groupId>com.ctw.mom</groupId>
        <version>0.1.0</version>
    </parent>

    <properties>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
        <jersey.version>2.28</jersey.version>
        <slf4j.version>1.7.21</slf4j.version>
        <log4j2.version>2.5</log4j2.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.amazonaws.serverless</groupId>
            <artifactId>aws-serverless-java-container-jersey</artifactId>
            <version>1.0</version>
        </dependency>
        <dependency>
            <groupId>org.glassfish.jersey.media</groupId>
            <artifactId>jersey-media-json-jackson</artifactId>
            <version>${jersey.version}</version>
        </dependency>
        <dependency>
            <groupId>org.glassfish.jersey.inject</groupId>
            <artifactId>jersey-hk2</artifactId>
            <version>${jersey.version}</version>
            <!-- excluding redundant javax.inject dependency -->
            <exclusions>
                <exclusion>
                    <groupId>org.glassfish.hk2</groupId>
                    <artifactId>hk2-api</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.glassfish.hk2</groupId>
            <artifactId>hk2-api</artifactId>
            <version>2.5.0-b42</version>
            <!-- excluding redundant javax.inject dependency -->
            <exclusions>
                <exclusion>
                    <groupId>javax.inject</groupId>
                    <artifactId>javax.inject</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>software.amazon.qldb</groupId>
            <artifactId>amazon-qldb-driver-java</artifactId>
            <version>1.0.1</version>
        </dependency>
        <dependency>
            <groupId>com.amazonaws</groupId>
            <artifactId>aws-java-sdk-sts</artifactId>
            <version>1.11.620</version>
        </dependency>
        <dependency>
            <groupId>com.amazon.ion</groupId>
            <artifactId>ion-java</artifactId>
            <version>1.6.1</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.dataformat</groupId>
            <artifactId>jackson-dataformat-ion</artifactId>
            <version>2.10.0</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>${slf4j.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-slf4j-impl</artifactId>
            <version>2.5</version>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-api</artifactId>
            <version>${log4j2.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>${log4j2.version}</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>2.3</version>
                <configuration>
                    <createDependencyReducedPom>false</createDependencyReducedPom>
                </configuration>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>

        </plugins>
    </build>
</project>
```

`log4j2.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="warn" name="MyApp" packages="">
    <Appenders>
        <!--        <File name="MyFile" fileName="app.log">-->
        <!--            <PatternLayout>-->
        <!--                <Pattern>%d %p %c{1.} [%t] %m%n</Pattern>-->
        <!--            </PatternLayout>-->
        <!--        </File>-->
        <!--        <Async name="Async">-->
        <!--            <AppenderRef ref="MyFile"/>-->
        <!--        </Async>-->
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>
    </Appenders>
    <Loggers>
        <Logger name="com.ctw" level="info">
            <AppenderRef ref="Console"/>
        </Logger>
        <Root level="error">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

`StreamLambdaHandler.java`

```java
package com.ctw.consent;

import com.amazonaws.serverless.proxy.jersey.JerseyLambdaContainerHandler;
import com.amazonaws.serverless.proxy.model.AwsProxyRequest;
import com.amazonaws.serverless.proxy.model.AwsProxyResponse;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;


public class StreamLambdaHandler implements RequestStreamHandler {

    private static final String PACK_SCAN= "com.ctw.consent";

    private static final ResourceConfig jerseyApplication = new ResourceConfig()
                                                                    .packages(PACK_SCAN)
                                                                    .register(JacksonFeature.class);

    private static final JerseyLambdaContainerHandler<AwsProxyRequest, AwsProxyResponse> handler
            = JerseyLambdaContainerHandler.getAwsProxyHandler(jerseyApplication);

    @Override
    public void handleRequest(InputStream inputStream, OutputStream outputStream, Context context) throws IOException {
        handler.proxyStream(inputStream, outputStream, context);

        // just in case it wasn't closed by the mapper
        outputStream.close();
    }
}
```

`OperationHelper.java`

```java
package com.ctw.consent.util;

import com.amazon.ion.IonStruct;
import software.amazon.qldb.Result;

import java.util.ArrayList;
import java.util.List;

public class OperationHelper {

    public static List<IonStruct> toIonStructs(Result result) {
        final List<IonStruct> documentList = new ArrayList<>();
        result.iterator().forEachRemaining(row -> documentList.add((IonStruct) row));
        return documentList;
    }
}
```

`CustomerService.java`

```java
package com.ctw.consent.service;

import com.amazon.ion.IonSystem;
import com.amazon.ion.system.IonSystemBuilder;
import com.ctw.consent.dao.Constants;
import com.ctw.consent.dao.CustomerRepository;
import com.ctw.consent.model.Customer;
import com.ctw.consent.model.DocumentID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class CustomerService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CustomerService.class);

    private static final IonSystem ion = IonSystemBuilder.standard().build();

    private CustomerRepository customerRepository;

    public CustomerService() {
        this.customerRepository = new CustomerRepository();
    }

    public List<Customer> findAll() throws Exception {
        return customerRepository.findAll();
    }

    public DocumentID add(Customer customer) throws Exception {

        LOGGER.info(String.format("Inserting customer  %s", customer));

        try {

            String documentID = this.customerRepository.insert(Constants.MAPPER.writeValueAsIonValue(customer));
            return Constants.MAPPER.readValue(documentID, DocumentID.class);

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            throw e;
        }
    }
}

```

`DocumentID.java`

```java
package com.ctw.consent.model;

public class DocumentID {

    private String documentId;

    public DocumentID() {
    }

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }
}

```

`Customer.java`

```java
package com.ctw.consent.model;


import com.amazon.ion.IonBool;
import com.amazon.ion.IonString;
import com.amazon.ion.IonStruct;
import com.amazon.ion.IonSystem;
import com.amazon.ion.system.IonSystemBuilder;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "document_id",
        "consent",
        "vin",
        "brand"
})
public class Customer {

    private static final IonSystem system = IonSystemBuilder.standard().build();
    @JsonProperty("vin")
    public String vin;
    @JsonProperty("consent")
    public Boolean consent;
    @JsonProperty("brand")
    public String brand;
    @JsonProperty("document_id")
    private String documentID;

    public Customer(String documentID, String vin, Boolean consent, String brand) {
        this.documentID = documentID;
        this.vin = vin;
        this.consent = consent;
        this.brand = brand;
    }

    public Customer() {
    }

    public static Customer decode(IonStruct struct) {
        return new Customer(((IonString) struct.get("id")).stringValue(), ((IonString) struct.get("vin")).stringValue(), ((IonBool) struct.get("consent")).booleanValue(), ((IonString) struct.get("brand")).stringValue());
    }

    public String getDocumentID() {
        return documentID;
    }

    public void setDocumentID(String documentID) {
        this.documentID = documentID;
    }

    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public Boolean getConsent() {
        return consent;
    }

    public void setConsent(Boolean consent) {
        this.consent = consent;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    @Override
    public String toString() {
        return "Customer{" +
                "vin='" + vin + '\'' +
                ", consent=" + consent +
                ", brand='" + brand + '\'' +
                ", documentID='" + documentID + '\'' +
                '}';
    }
}

```

`CustomerRepository.java`

```java
package com.ctw.consent.dao;

import com.amazon.ion.IonString;
import com.amazon.ion.IonStruct;
import com.amazon.ion.IonValue;
import com.ctw.consent.model.Customer;
import com.ctw.consent.util.OperationHelper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import software.amazon.qldb.PooledQldbDriver;
import software.amazon.qldb.Result;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class CustomerRepository {

    private final Logger LOGGER = LogManager.getLogger(CustomerRepository.class);

    public String insert(IonValue data) throws Exception {

        try (PooledQldbDriver session = ConnectToLedger.createQldbSession()) {

            LOGGER.info(String.format("Appending new document to %s", Constants.TABLE_CONSENTS));

            final String query = String.format("INSERT INTO %s ?", Constants.TABLE_CONSENTS);

            final List<IonValue> parameters = Collections.singletonList(data);
            Result result = session.getSession().execute(query, parameters);
            if (result.isEmpty()) {
                throw new Exception("No documents updated when at least one document expected.");
            }

            List<IonStruct> cursor = OperationHelper.toIonStructs(result);
            Optional<com.amazon.ion.IonStruct> resultDocumentID = cursor.stream().findFirst();

            if (resultDocumentID.isPresent()) {
                return resultDocumentID.get().toPrettyString();
            } else {
                throw new Exception("No document id was find to return, check log files.");
            }

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            throw e;
        }
    }

    public String update(Customer Customer, String documentID) throws Exception {

        LOGGER.info(String.format("Updating new document to %s by document id %s", Constants.TABLE_CONSENTS, documentID));

        try (PooledQldbDriver session = ConnectToLedger.createQldbSession()) {

            final StringBuilder SQL = new StringBuilder();
            SQL.append("UPDATE " + Constants.TABLE_CONSENTS + " AS t BY pid SET t.vin = ?,");
            SQL.append("t.vin = ?,");
            SQL.append("t.consent = ?,");
            SQL.append("t.brand = ?,");
            SQL.append("WHERE pid = ?");

            final List<IonValue> parameters = new ArrayList<>();
            parameters.add(Constants.MAPPER.writeValueAsIonValue(Customer.getVin()));
            parameters.add(Constants.MAPPER.writeValueAsIonValue(Customer.getConsent()));
            parameters.add(Constants.MAPPER.writeValueAsIonValue(Customer.getBrand()));
            parameters.add(Constants.MAPPER.writeValueAsIonValue(documentID));

            Result result = session.getSession().execute(SQL.toString(), parameters);

            if (result.isEmpty()) {
                throw new Exception("No documents updated when at least one document expected.");
            }

            List<IonStruct> cursor = OperationHelper.toIonStructs(result);
            Optional<IonStruct> resultDocumentID = cursor.stream().findFirst();

            if (resultDocumentID.isPresent()) {
                return resultDocumentID.get().toPrettyString();
            } else {
                throw new Exception("No document id was find to return, check log files.");
            }

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            throw e;
        }
    }

    public List<Customer> findAll() throws Exception {

        try (PooledQldbDriver session = ConnectToLedger.createQldbSession()) {

            final String query = String.format("SELECT id, c.* FROM %s AS c BY id", Constants.TABLE_CONSENTS);

            Result result = session.getSession().execute(query);
            List<IonStruct> cursor = OperationHelper.toIonStructs(result);
            List<Customer> data = new ArrayList<>();
            for(IonStruct c : cursor) {
                Customer customer = Customer.decode(c);
                data.add(new Customer(customer.getDocumentID(), customer.getVin(), customer.getConsent(), customer.getBrand()));
            }

            return data;

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            throw e;
        }
    }

    public Customer findById(String documentID) throws Exception {

        try (PooledQldbDriver session = ConnectToLedger.createQldbSession()) {

            final String query = String.format("SELECT * FROM %s AS c BY id WHERE id = ?", Constants.TABLE_CONSENTS);
            final List<IonValue> parameters = Collections.singletonList(Constants.MAPPER.writeValueAsIonValue(documentID));
            Result result = session.getSession().execute(query, parameters);
            if (result.isEmpty()) {
                throw new Exception(String.format("No car history found for DOC ID %s.", documentID));
            }
            List<IonStruct> cursor = OperationHelper.toIonStructs(result);
            return Customer.decode(cursor.get(0));

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            throw e;
        }
    }

    public Customer findByVIN(String vin) throws Exception {

        try (PooledQldbDriver session = ConnectToLedger.createQldbSession()) {

            final String query = String.format("SELECT pid, c.* from %s AS c BY pid WHERE c.vin = ?", Constants.TABLE_CONSENTS);
            final List<IonValue> parameters = Collections.singletonList(Constants.MAPPER.writeValueAsIonValue(vin));
            Result result = session.getSession().execute(query, parameters);
            if (result.isEmpty()) {
                throw new Exception(String.format("No car history found for VIN %s.", vin));
            }
            List<IonStruct> cursor = OperationHelper.toIonStructs(result);
            return Customer.decode(cursor.get(0));

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            throw e;
        }
    }
}

```

`Constants.java`

```java
package com.ctw.consent.dao;

import com.fasterxml.jackson.dataformat.ion.IonObjectMapper;

public class Constants {

    public static final String LEDGER_NAME = "di-ledger";

    public static final String REGION = "us-east-1";

    public static final int RETRY_LIMIT = 4;

    public static final IonObjectMapper MAPPER = new IonObjectMapper();

    public static final String TABLE_CONSENTS = "Consents";

    public static final String ROLE = "arn:aws:iam::720205669273:role/ccc-administration/OwnFull";

    public static final String ACCESS_KEY = "";

    public static final String PRIVATE_KEY = "";
}
```

`ConnectToLedger.java`

```java
package com.ctw.consent.dao;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.BasicSessionCredentials;
import com.amazonaws.services.qldbsession.AmazonQLDBSessionClientBuilder;
import com.amazonaws.services.securitytoken.AWSSecurityTokenService;
import com.amazonaws.services.securitytoken.AWSSecurityTokenServiceClientBuilder;
import com.amazonaws.services.securitytoken.model.AssumeRoleRequest;
import com.amazonaws.services.securitytoken.model.AssumeRoleResult;
import software.amazon.qldb.PooledQldbDriver;


public final class ConnectToLedger {

    public static AWSCredentialsProvider credentialsProvider;

    public static PooledQldbDriver createQldbSession() {

        AmazonQLDBSessionClientBuilder builder = AmazonQLDBSessionClientBuilder.standard().withRegion(Constants.REGION);

        return PooledQldbDriver.builder()
                .withLedger(Constants.LEDGER_NAME)
                .withRetryLimit(Constants.RETRY_LIMIT)
                .withSessionClientBuilder(builder)
                .build();
    }

    // CONNECT TO A LEDGER USING ASSUME ROLE API
    public PooledQldbDriver createQldbSessionAssumeRole() {

        BasicAWSCredentials basic = new BasicAWSCredentials(Constants.ACCESS_KEY, Constants.PRIVATE_KEY);

        AWSSecurityTokenServiceClientBuilder stsBuilder = AWSSecurityTokenServiceClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(basic))
                .withRegion(Constants.REGION);

        AWSSecurityTokenService sts = stsBuilder.build();

        AssumeRoleRequest assumeRequest = new AssumeRoleRequest().withRoleArn(Constants.ROLE).withRoleSessionName("trs");

        AssumeRoleResult assumeResult = sts.assumeRole(assumeRequest);

        BasicSessionCredentials cred = new BasicSessionCredentials(assumeResult.getCredentials().getAccessKeyId(),
                assumeResult.getCredentials().getSecretAccessKey(),
                assumeResult.getCredentials().getSessionToken());

        AmazonQLDBSessionClientBuilder builder = AmazonQLDBSessionClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(cred))
                .withRegion(Constants.REGION);

        return PooledQldbDriver.builder()
                .withLedger(Constants.LEDGER_NAME)
                .withRetryLimit(Constants.RETRY_LIMIT)
                .withSessionClientBuilder(builder)
                .build();
    }
}
```

`CustomerResource.java`

```java
package com.ctw.consent.api;


import com.ctw.consent.model.Customer;
import com.ctw.consent.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/customers")
public class CustomerResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(CustomerResource.class);

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response findAll() {

        try {

            LOGGER.info("Getting all consents");
            CustomerService customerService = new CustomerService();
            return Response.status(200).entity(customerService.findAll()).build();

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            return Response.status(500).entity(e.getMessage()).build();
        }
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response insert(Customer form) {

        try {

            if (validateUserConsent(form)) {

                LOGGER.info("Adding user consent {}", form);
                CustomerService customerService = new CustomerService();
                customerService.add(form);

            } else {
                return Response.status(400).build();
            }

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            return Response.status(500).entity(e.getMessage()).build();
        }

        return Response.status(200).build();
    }

    private Boolean validateUserConsent(Customer form) {
        return form.getVin() != null && !"".equals(form.getVin());
    }
}
```

`sam.yaml` This file is used to create a serverless application that you can package and deploy in the AWS Cloud. You can get details on [https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: AWS Serverless Jersey API - Customer Endpoint
Resources:
  CustomerFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: com.ctw.consent.StreamLambdaHandler::handleRequest
      Runtime: java8
      CodeUri: target/customer-0.1.0.jar
      MemorySize: 512
      Policies:
        - AWSLambdaBasicExecutionRole
        - arn:aws:iam::aws:policy/AmazonQLDBFullAccess
      Timeout: 15
      Events:
        GetResource:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: any

Outputs:
  CustomerApi:
    Description: URL for application
    Value: !Sub 'https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Stage/customers'
    Export:
      Name: CarDataCustomerApi
```

After set up a standard Java project with the source code, you have to get your AWS roles and private keys and then
replace them in `Constants.java` class.

### Deploying

Run the script `deploy.sh`, once it's finished, you can access you AWS web console, navigate to the gateway api service and test it.

`deploy.sh`

```bash
#!/bin/bash

stack='DI-STACK'
bucket='java-prototype-di'

echo 'Building project'

mvn -T 2C clean install -DskipTests=true

#echo 'Delete previous stack'
#aws cloudformation delete-stack --stack-name $stack

sleep 5

echo 'Uploading artifact to S3 bucket' $bucket
aws cloudformation package --template-file sam.yaml --output-template-file output-sam.yaml --s3-bucket $bucket

sleep 5

echo 'Deploying function as a service'
aws cloudformation deploy --template-file output-sam.yaml --stack-name $stack --capabilities CAPABILITY_IAM

sleep 10

aws cloudformation describe-stacks --stack-name $stack
```


