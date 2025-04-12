---
title: 'Lambda & S3'
date: "2014-07-03"
draft: false
---

Deploying AWS Lambda using Java and AWS Serverless Application Model(SAM).

pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>io.tiago</groupId>
  <artifactId>HelloWorldLambdaJava</artifactId>
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

`template.yaml`

```yaml
AWSTemplateFormatVersion: 2010-09-09
Transform: AWS::Serverless-2016-10-31
Description: HelloWorldLambdaJava

Resources:

  HelloWorldLambda:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: java8
      MemorySize: 512
      Handler: buckets.ListBuckets::handler
      CodeUri: target/lambda.jar
      Timeout: 60
      Environment:
        Variables:
          ACCESS_KEY: key
          SECRET_KEY: secret
```

`samconfig.toml`

```toml
version = 0.1
[default]
[default.deploy]
[default.deploy.parameters]
stack_name = "starter"
s3_bucket = "starter-zip"
s3_prefix = "starter"
region = "us-west-2"
confirm_changeset = true
capabilities = "CAPABILITY_IAM"
image_repositories = []
```

`ListBuckets.java`

```java
package buckets;

import java.util.ArrayList;
import java.util.List;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.Bucket;

public class ListBuckets {

    public List<String> handler() {

        try {

            List<String> resp = new ArrayList<>();

            BasicAWSCredentials awsCreds = new BasicAWSCredentials(System.getenv("ACCESS_KEY"), System.getenv("SECRET_KEY"));
            final AmazonS3 s3 = AmazonS3ClientBuilder.standard()
                                                     .withRegion(Regions.US_WEST_2)
                                                     .withCredentials(new AWSStaticCredentialsProvider(awsCreds))
                                                     .build();
            
            List<Bucket> buckets = s3.listBuckets();            
            for (Bucket b : buckets) {
                resp.add("-> " + b.getName());
            }
            
            return resp;

        } catch (Exception e) {
           e.printStackTrace();
           throw e;
        }
    }
}
```
