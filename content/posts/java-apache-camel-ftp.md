+++

title = 'Apache Camel FTP'
date = 1500-02-20T19:18:41-03:00

draft = false


+++

### What is Camel ?

Camel is an integration framework that aims to make your integration projects productive and fun.

Camel offers higher-level abstractions that allow you to interact with various systems
by using the same API regardless of the protocol or data type the systems are using. Components in Camel provide specific implementations of the API that target differ-ent protocols and data types using enterprise application patterns (EAP).

### Example

This example below demonstrate how to fetch Apache Zookeeper from an FTP server to a folder in our local machine.

```xml
<dependencies>
    <!-- Camel Dependencies -->
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-core</artifactId>
        <version>2.20.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-bindy</artifactId>
        <version>2.20.0</version>
    </dependency>
    <!-- FTP -->
    <dependency>
        <groupId>org.apache.camel</groupId>
        <artifactId>camel-ftp</artifactId>
        <version>2.20.0</version>
    </dependency>
    <dependency>
        <groupId>commons-io</groupId>
        <artifactId>commons-io</artifactId>
        <version>2.6</version>
    </dependency>
    <!--        JAVA 11+ REQ. -->
    <dependency>
        <groupId>javax.xml.bind</groupId>
        <artifactId>jaxb-api</artifactId>
        <version>2.3.0</version>
    </dependency>
    <dependency>
        <groupId>com.sun.xml.bind</groupId>
        <artifactId>jaxb-core</artifactId>
        <version>2.3.0</version>
    </dependency>
    <dependency>
        <groupId>com.sun.xml.bind</groupId>
        <artifactId>jaxb-impl</artifactId>
        <version>2.3.0</version>
    </dependency>
</dependencies>
```

```java
import org.apache.camel.builder.RouteBuilder;

public class FtpRouter extends RouteBuilder {

    @Override
    public void configure() throws Exception {        
        from("ftp://ftp.unicamp.br/pub/apache/zookeeper/zookeeper-3.5.9")
        .to("file://data/outbox")
        .log("Getting FTP files..");
    }
}
```

```java
import org.apache.camel.CamelContext;
import org.apache.camel.impl.DefaultCamelContext;

import io.tiago.ftp.FtpRouter;

public class App {

    public static void main(String[] args) throws Exception {
        CamelContext context = new DefaultCamelContext();
        context.disableJMX();
        context.setMessageHistory(true);
        context.addRoutes(new FtpRouter());
        context.start();
        Thread.sleep(60000);
        context.stop();
    }
}
```
