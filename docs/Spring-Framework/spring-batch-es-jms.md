---
title:  'Spring Batch + Elasticsearch + JMS'
date: 2017-05-06T19:18:41-03:00
draft: false
---


Processing data using <a href="https://spring.io/projects/spring-batch" target="_blank"> Spring Batch </a>, <a href="https://activemq.apache.org/components/artemis/" target="_blank">ArtemisMQ</a> and <a href="https://www.elastic.co/" target="_blank">Elasticsearch</a>.

`animal.sql`

```sql
CREATE TABLE IF NOT EXISTS ANIMAL  (
    id int(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    scientificName VARCHAR(50),
    status VARCHAR(50),
    veterinarian VARCHAR(50),
    created DATE
);
```

`pom.xml`

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>org.tiago</groupId>
    <artifactId>spring-batch</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.1.RELEASE</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.batch</groupId>
            <artifactId>spring-batch-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-activemq</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>3.4.5</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-oxm</artifactId>
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

    <properties>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
    </properties>
</project>
```

`application.properties`

```java
log4j.logger.org.springframework.jdbc=debug
log4j.logger.org.springframework.batch=debug
# MAIN DB
spring.datasource.jdbcUrl=jdbc:mysql://localhost:3306/test
spring.datasource.username=root
spring.datasource.password=12345678
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
# SECONDARY DB
spring.second-db.jdbcUrl=jdbc:mysql://192.168.1.7:3306/test
spring.second-db.username=api
spring.second-db.password=12345678
spring.second-db.driverClassName=com.mysql.cj.jdbc.Driver
spring.batch.initialize-schema=always
spring.datasource.initialization-mode=always
spring.main.allow-bean-definition-overriding=true
spring.batch.job.enabled=false
# ELASTIC SEARCH
elasticsearch.clustername=elasticsearch
elasticsearch.host=localhost
elasticsearch.port=9300
```

`DatasourceConfig.java`

```java
package com.tiago.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class DatasourceConfig {

    @Bean(name = "db1")
    @ConfigurationProperties(prefix = "spring.datasource")
    @Primary
    public DataSource dataSource1() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "jdbcTemplate1")
    public JdbcTemplate jdbcTemplate1(@Qualifier("db1") DataSource ds) {
        return new JdbcTemplate(ds);
    }

    @Bean(name = "db2")
    @ConfigurationProperties(prefix = "spring.second-db")
    public DataSource dataSource2() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "jdbcTemplate2")
    public JdbcTemplate jdbcTemplate2(@Qualifier("db2") DataSource ds) {
        return new JdbcTemplate(ds);
    }
}
```

`ElasticsearchConfig.java`

```java
package com.tiago.config;

import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.TransportAddress;
import org.elasticsearch.transport.client.PreBuiltTransportClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

import java.net.InetAddress;

@Configuration
@EnableElasticsearchRepositories(basePackages = "com.tiago.repository")
public class ElasticsearchConfig {

    @Value("${elasticsearch.host}")
    private String esHost;

    @Value("${elasticsearch.port}")
    private int esPort;

    @Value("${elasticsearch.clustername}")
    private String esClusterName;

    @Bean
    public Client client() throws Exception {
        Settings settings = Settings.builder()
                .put("cluster.name", esClusterName)
                .build();

        TransportClient client = new PreBuiltTransportClient(settings);
        client.addTransportAddress(new TransportAddress(InetAddress.getByName(esHost), esPort));
        return client;
    }

    @Bean
    public ElasticsearchOperations elasticsearchTemplate() throws Exception {
        return new ElasticsearchTemplate(client());
    }
}
```

`JmsConfig.java`

```java
package com.tiago.config;

import org.springframework.boot.autoconfigure.jms.DefaultJmsListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;
import org.springframework.jms.config.JmsListenerContainerFactory;

import javax.jms.ConnectionFactory;

@EnableJms
public class JmsConfig {

    @Bean
    public JmsListenerContainerFactory<?> myFactory(ConnectionFactory connectionFactory,
                                                    DefaultJmsListenerContainerFactoryConfigurer configurer) {
        DefaultJmsListenerContainerFactory factory = new DefaultJmsListenerContainerFactory();
        configurer.configure(factory, connectionFactory);
        return factory;
    }
}
```

This class represents our table `animal` created previously.

`Animal.java`

```java
package com.tiago.model;

import java.io.Serializable;
import java.util.Date;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;


public class Animal implements Serializable {

    private static final long serialVersionUID = 1L;

    private int id;
    
    private String scientificName;
    
    private String status;
    
    private String veterinarian;
    
    private Date created;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVeterinarian() {
        return veterinarian;
    }

    public void setVeterinarian(String veterinarian) {
        this.veterinarian = veterinarian;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }
}
```

`Animal.java`

```java
package com.tiago.model.es;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;

import java.util.Date;

@Document(indexName = "animal-idx", type = "animals")
public class Animal {

    @Id
    private String id;

    private String scientificName;

    private String status;

    private String veterinarian;

    private Date created;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVeterinarian() {
        return veterinarian;
    }

    public void setVeterinarian(String veterinarian) {
        this.veterinarian = veterinarian;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }
}
```

`AnimalRepository.java`

```java
package com.tiago.repository;

import com.tiago.model.es.Animal;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface AnimalRepository extends ElasticsearchRepository<Animal, String> {
}
```

`EsItemReader.java`

```java
package com.tiago.beans.es;


import com.tiago.model.Animal;
import com.tiago.util.AnimalRowMapper;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.database.JdbcCursorItemReader;
import org.springframework.batch.item.database.builder.JdbcCursorItemReaderBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

@Component
@StepScope
public class EsItemReader implements ItemReader<JdbcCursorItemReader<Animal>> {

    private static final Logger LOGGER = Logger.getLogger(EsItemReader.class.getSimpleName());

    @Value("#{jobParameters['tableName']}")
    private String tableName;

    @Autowired
    @Qualifier("jdbcTemplate1")
    private JdbcTemplate jdbcTemplate;

    public JdbcCursorItemReader<Animal> read() throws Exception {


        LOGGER.info("** READING DATABASE ENTRIES! **");

        final String SQL = "SELECT * FROM " + this.tableName + " ORDER BY id DESC LIMIT 1";

        return new JdbcCursorItemReaderBuilder<Animal>()
                .sql(SQL)
                .dataSource(this.jdbcTemplate.getDataSource())
                .rowMapper(new AnimalRowMapper())
                .name("replication-cursor")
                .build();
    }
}

```

`EsItemWriter.java`

```java
package com.tiago.beans.replication;


import com.tiago.model.Animal;
import com.tiago.repository.AnimalRepository;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.logging.Logger;

@Component
public class EsItemWriter implements ItemWriter<Animal> {

    private static final Logger LOGGER = Logger.getLogger(EsItemWriter.class.getSimpleName());

    @Autowired
    private AnimalRepository animalRepository;

    @Override
    public void write(List<? extends Animal> items) throws Exception {

        LOGGER.info("** WRITING DATABASE ENTRIES INTO ES! **");

        for (Animal item : items) {
            Optional<com.tiago.model.es.Animal> animal = animalRepository.findById(String.valueOf(item.getId()));
            if (animal.isPresent()) {
                animal.get().setId(String.valueOf(item.getId()));
                animal.get().setStatus(item.getStatus());
                animal.get().setScientificName(item.getScientificName());
                animal.get().setVeterinarian(item.getVeterinarian());
                animal.get().setCreated(item.getCreated());
                animalRepository.save(animal.get());
            } else {
                com.tiago.model.es.Animal a = new com.tiago.model.es.Animal();
                a.setId(String.valueOf(item.getId()));
                a.setStatus(item.getStatus());
                a.setScientificName(item.getScientificName());
                a.setVeterinarian(item.getVeterinarian());
                a.setCreated(item.getCreated());
                animalRepository.save(a);
            }
        }
    }
}
```

`EsItemProcessor.java`

```java
package com.tiago.beans.replication;

import com.tiago.model.Animal;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

@Component
public class EsItemProcessor implements ItemProcessor<Animal, Animal> {

    private static final Logger LOGGER = Logger.getLogger(EsItemProcessor.class.getSimpleName());

    @Override
    public Animal process(Animal animal) throws Exception {

        LOGGER.info("** PROCESSING DB ENTRIES! **");

        if (animal.getStatus().equalsIgnoreCase("bad")) {
            animal.setStatus("changed from bad to good");
        }

        return animal;
    }
}
```

`JobCompletionNotificationListener.java`

```java
package com.tiago.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListenerSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class JobCompletionNotificationListener extends JobExecutionListenerSupport {

    private static final Logger LOG = LoggerFactory.getLogger(JobCompletionNotificationListener.class);

    @Autowired
    @Qualifier("jdbcTemplate2")
    private JdbcTemplate jdbcTemplate;

    @Override
    public void afterJob(JobExecution jobExecution) {

        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {

            LOG.info("JOB FINISHED");
        }
    }
}
```

`ElasticSearchJob.java`

```java
package com.tiago.jobs;

import com.tiago.beans.es.EsItemProcessor;
import com.tiago.beans.es.EsItemReader;
import com.tiago.beans.es.EsItemWriter;
import com.tiago.listener.JobCompletionNotificationListener;
import com.tiago.model.Animal;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticSearchJob {

    @Autowired
    private JobBuilderFactory jobBuilders;

    @Autowired
    private StepBuilderFactory stepBuilders;

    @Autowired
    private EsItemReader readerEs;

    @Autowired
    private EsItemWriter writerEs;

    @Bean
    public EsItemProcessor processorReplica() {
        return new EsItemProcessor();
    }

    @Bean
    public Job esJob(JobCompletionNotificationListener listener) throws Exception {
        return jobBuilders.get("es").listener(listener)
                .incrementer(new RunIdIncrementer())
                .flow(step1())
                .end().build();
    }

    @Bean
    public Step step1() throws Exception {

        return stepBuilders.get("step1").<Animal, Animal>chunk(1).reader(readerEs.read())
                .faultTolerant()
                .skipLimit(1)
                .skip(NullPointerException.class)
                .processor(processorReplica())
                .faultTolerant()
                .skipLimit(1)
                .skip(NullPointerException.class)
                .writer(writerEs)
                .faultTolerant()
                .skipLimit(1)
                .skip(NullPointerException.class)
                .build();
    }
}

```

`MessageDrivenBean.java`

```java
package com.tiago.mdb;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class MessageDrivenBean {

    @Autowired
    private JobLauncher jobLauncher;

    @Autowired
    private Job job;

    @JmsListener(destination = "batch-job", containerFactory = "myFactory")
    public void receiveMessage(String message) throws Exception {
        System.out.println(message);
        JobParameters jobParameters = new JobParametersBuilder().addLong("time", System.currentTimeMillis())
                .addString("tableName", message).toJobParameters();
        JobExecution execution = jobLauncher.run(job, jobParameters);
        System.out.println("Exit Status : " + execution.getStatus());
    }
}
```

`App.java`

```java
package com.tiago;

import com.tiago.config.DatasourceConfig;
import com.tiago.config.JmsConfig;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.jms.core.JmsTemplate;

@SpringBootApplication
@EnableBatchProcessing
@Import({DatasourceConfig.class, JmsConfig.class})
@ComponentScan({"com.tiago.*"})
public class App implements CommandLineRunner {

    @Autowired
    private JmsTemplate jmsTemplate;

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        String tableName = "animal";
        jmsTemplate.convertAndSend("batch-job", tableName);
    }
}

```
<img src="/images/site/spring-batch/spring-batch-artemis.png" width="auto" >

