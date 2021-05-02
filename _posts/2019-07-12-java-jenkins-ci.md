---
layout: post
title:  Java - Jenkins CI
date:   2019-07-12 20:18:00 +0100
category: Dev
tags: CI jenkins java docker
---

#### Introduction

This post contains some steps to configure a Jenkins CI server. 

Continuous Integration is a software enginnering practice to integrate developers code at least once a day. This practice brings many benefits for the software being developed. You can find more information about it on [Wikipedia](https://en.wikipedia.org/wiki/Continuous_integration).

#### Jenkins CI

As prerequisites we have to install [Virtualbox](https://www.virtualbox.org/wiki/Downloads) and [Vagrant](https://www.vagrantup.com/downloads).

Once we have both tools installed, save this file below as `Vagrantfile` in any directory, and then through a terminal, run this command `vagrant up`. This
will spin up an Ubuntu machine with [Jenkins](https://www.jenkins.io/), [Docker](https://www.docker.com/) and [Gogs](https://gogs.io/).

```ruby
# -*- mode: ruby -*-
# vi: set ft=ruby :

# $script = <<-SCRIPT
#   echo 'My Custom Script...'
# SCRIPT

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "hashicorp/bionic64"
  # config.vm.box_version = "20170922.0.0"
  # config.vm.provision "shell", inline: $script
  # config.vm.provision :shell, :inline => "/home/vagrant/gogs/gogs web &", :run => 'always', privileged: false

  config.trigger.after :up do |trigger|
    trigger.name = "Starting Gogs"
    # trigger.run_remote = {inline: "export PATH:$PATH:/home/vagrant/gogs"}
    trigger.run_remote = {inline: "/home/vagrant/gogs/gogs web"}
  end

  config.vm.network "forwarded_port", guest: 8080, host: 8085
  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.provider "virtualbox" do |v|
    v.memory = 4096
  end

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", inline: <<-SHELL

    # Install OpenJDK Java JDK and Maven
    add-apt-repository ppa:openjdk-r/ppa
    apt-get -y update
    apt-get install -y openjdk-8-jdk
    apt-get install -y maven

    # Install Docker
    apt-get install -y docker.io

    # Install Gogs
    mkdir -p /var/gogs
    wget https://dl.gogs.io/0.12.3/gogs_0.12.3_linux_amd64.zip
    apt-get -y install unzip
    unzip gogs_0.12.3_linux_amd64.zip
   
    # Install Docker Compose
    curl -s -L https://github.com/docker/compose/releases/download/1.10.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Install Jenkins
    wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
    apt-add-repository "deb http://pkg.jenkins-ci.org/debian binary/"
    apt-get -y update
    apt install -y jenkins
    # Echo the Jenkins security key that is required upon initialisation
    printf "\n\nJENKINS KEY\n*********************************"
    # Add the Jenkins user to the Docker group
    usermod -aG docker jenkins
    # Wait until the initialAdminPassword file is generated via Jenkins startup
    while [ ! -f /var/lib/jenkins/secrets/initialAdminPassword ]
    do
        sleep 2
    done
    cat /var/lib/jenkins/secrets/initialAdminPassword
    printf "*********************************"
    usermod -aG docker $USER
    newgrp docker
    # restart the Jenkins service so that the usermod command above takes effect
    service jenkins restart

    chmod -R 777 /home/vagrant/gogs
    chown -R vagrant /home/vagrant/gogs

  SHELL
end

```

#### Java Project

This project is basic VertX web application to simulate our workflow.

`pom.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example.starter</groupId>
  <artifactId>demo</artifactId>
  <version>0.1.0</version>

  <properties>
    <java.version>1.8</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <vertx.version>3.9.7</vertx.version>
    <junit-jupiter.version>5.7.0</junit-jupiter.version>
    <vertx.verticle>com.example.starter.MainVerticle</vertx.verticle>
    <fabric8-vertx-maven-plugin.version>1.0.5</fabric8-vertx-maven-plugin.version>
    <slf4j.version>1.7.21</slf4j.version>
    <log4j2.version>2.5</log4j2.version>
  </properties>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>io.vertx</groupId>
        <artifactId>vertx-dependencies</artifactId>
        <version>${vertx.version}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <dependencies>
    <dependency>
      <groupId>io.vertx</groupId>
      <artifactId>vertx-web</artifactId>
    </dependency>
    <dependency>
      <groupId>io.vertx</groupId>
      <artifactId>vertx-codegen</artifactId>
      <scope>provided</scope>
    </dependency>

    <dependency>
      <groupId>io.vertx</groupId>
      <artifactId>vertx-junit5</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter-api</artifactId>
      <version>${junit-jupiter.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter-engine</artifactId>
      <version>${junit-jupiter.version}</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>io.fabric8</groupId>
        <artifactId>vertx-maven-plugin</artifactId>
        <version>${fabric8-vertx-maven-plugin.version}</version>
        <executions>
          <execution>
            <id>vmp</id>
            <goals>
              <goal>initialize</goal>
              <goal>package</goal>
            </goals>
          </execution>
        </executions>
        <configuration>
          <redeploy>true</redeploy>
        </configuration>
      </plugin>
      <plugin>
        <artifactId>maven-clean-plugin</artifactId>
        <version>3.0.0</version>
        <configuration>
          <filesets>
            <fileset>
              <directory>${project.basedir}/src/main/generated</directory>
            </fileset>
          </filesets>
        </configuration>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.6.2</version>
        <configuration>
          <encoding>${project.build.sourceEncoding}</encoding>
          <source>${java.version}</source>
          <target>${java.version}</target>
          <useIncrementalCompilation>false</useIncrementalCompilation>
          <annotationProcessors>
            <annotationProcessor>io.vertx.codegen.CodeGenProcessor</annotationProcessor>
          </annotationProcessors>
          <generatedSourcesDirectory>${project.basedir}/src/main/generated</generatedSourcesDirectory>
          <compilerArgs>
            <arg>-AoutputDirectory=${project.basedir}/src/main</arg>
          </compilerArgs>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

`MainVerticle.java`
```java
package com.example.starter;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServer;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.StaticHandler;

import java.util.HashSet;
import java.util.Set;


public class MainVerticle extends AbstractVerticle {

  public static void main(String[] args) {
    Vertx vertx = Vertx.vertx();
    vertx.deployVerticle(new MainVerticle());
  }

  @Override
  public void start() {

    Router router = Router.router(vertx);
    router.route("/assets/*").handler(StaticHandler.create("assets"));
    router.route().handler(BodyHandler.create());

    Set<String> allowedHeaders = new HashSet<>();
    allowedHeaders.add("Access-Control-Allow-Origin");
    allowedHeaders.add("Content-Type");
    allowedHeaders.add("accept");

    Set<HttpMethod> allowedMethods = new HashSet<>();
    allowedMethods.add(HttpMethod.GET);
    allowedMethods.add(HttpMethod.POST);
    allowedMethods.add(HttpMethod.DELETE);
    allowedMethods.add(HttpMethod.OPTIONS);

    router.route().handler(CorsHandler.create("*").allowedHeaders(allowedHeaders).allowedMethods(allowedMethods));

    router.get("/").handler(this::index);

    HttpServer server = vertx.createHttpServer();

    server.requestHandler(router).listen(8001, "0.0.0.0");
  }

  private void index(RoutingContext routingContext) {
    routingContext.response().setStatusCode(200).end("Hello v1");
  }

}
```

`TestMainVerticle.java`

```java
package com.example.starter;

import io.vertx.core.Vertx;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.junit.jupiter.api.Assertions.assertEquals;


@ExtendWith(VertxExtension.class)
public class TestMainVerticle {

  @BeforeEach
  void deploy_verticle(Vertx vertx, VertxTestContext testContext) {
    vertx.deployVerticle(new MainVerticle(), testContext.succeeding(id -> testContext.completeNow()));
  }

  @Test
  void when_v1_then_ok(Vertx vertx, VertxTestContext testContext) throws Throwable {
    vertx.createHttpClient().getNow(8001, "localhost", "/", response -> {
      response.exceptionHandler(testContext::failNow);
      response.handler(body -> {
        assertEquals(body.toString(), "Hello v1");
        testContext.completeNow();
      });
    });
  }
}
```

At this point we have a VertX application returning a simple text message and a small unit/integration test. 

You can create a deployment package with `mvn clean package` and run it executing `java -jar target/demo-0.1.0.jar`. Once it's running you can
call `curl http://localhost:8001` from a terminal to get our response `Hello v1` back.

Finally a `Dockerfile` to create our docker image for later deployment. 

```docker
FROM adoptopenjdk/openjdk11:latest
LABEL maintainer Tiago Ribeiro
COPY target/demo-0.1.0.jar .
EXPOSE 8001
CMD java ${JAVA_OPTS} -jar demo-0.1.0.jar
```


#### Gogs

[Gogs](https://gogs.io/) is a self-hosted Git service. You can access it on `http://localhost:3000`.

The previous code can be versioned as a common git repository by.

```bash
git init
git add .
git commit -m "first commit"
git remote add origin http://localhost:3000/metiago/starter.git
git push -u origin master
```

<img src="{{site.github.url}}/assets/img/jenkins/gogs.png" width="100%" height="100%"/>


#### Jenkins

After we have our code pushed into Gogs we can access Jenkins at `http://localhost:8085/` and set up our CI server.

Once logged in Jenkins click `Manage Jenkins -> Manage Plugins` and then on the tab `Available` search for `CloudBees Docker Build and Publish` and install it.

Execute the same steps for this plugin `GitHub Integration`.

<img src="{{site.github.url}}/assets/img/jenkins/jenkins_plugins.png" width="100%" height="100%"/>

Now on the dashboard, create a pipeline `New Item`.

<img src="{{site.github.url}}/assets/img/jenkins/jenkins_pipeline.png" width="100%" height="100%"/>

On the configuration, check `GitHub project` and add the `project url`, in this example `http://localhost:3000/metiago/starter`.

<img src="{{site.github.url}}/assets/img/jenkins/jenkins_pipeline_general.png" width="100%" height="100%"/>

Check `GitHub hook trigger for GITScm polling`.

<img src="{{site.github.url}}/assets/img/jenkins/jenkins_pipeline_trigger.png" width="100%" height="100%"/>

Add the script below in the pipeline input.

```groovy
def hash() {
    stdout = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
    println("HASH = ${stdout}")
    return stdout
}

def buildImage() {
    registry = "metiago/starter"
    tag = hash()
    sh "docker build -t " + registry + ":" + tag + " ."
}

def deploy() {
    registry = "metiago/starter"
    tag = hash()
    sh 'docker push ' + registry + ":" + tag
}

pipeline {
    environment {
        registryCredential = 'dockerhub'
    }
    agent {
        node {
            label 'master'
            customWorkspace "/var/lib/jenkins/workspace/starter"
        }
    }
    stages {
        stage('Pull Git') {
            steps {
                echo 'Pulling Git...'
                sh 'git pull origin master'
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'mvn clean compile'
            }
        }
        stage('Unit Tests') {
            steps {
                 echo 'Running Unit Tests...'
                 sh 'mvn clean package'
            }
        }
        stage('Dockerizing') {
            steps {
                buildImage()
            }
        }
        stage('Integ. Tests') {
            steps {
                echo 'Running Integration Tests...'
                sh 'mvn clean verify'
            }
        }
        stage('Push Image') {

            steps {

                withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'dockerHubPassword', usernameVariable: 'dockerHubUser')]) {
                    sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPassword}"
                    deploy()
                }                
            }
        }
    }
}
```

One last configuration step should be done, navigate to `Dashboard -> Credentials -> System -> Global Credentials` and add your docker registry credentials. 

Note that the id, in this example `dockerhub`, is the same as the `credentialsId` in the `Push Image` stage on the script above.

<img src="{{site.github.url}}/assets/img/jenkins/jenkins_credentials.png" width="100%" height="100%"/>


Finally, click on `Build Now` to execute this pipeline.

<img src="{{site.github.url}}/assets/img/jenkins/jenkins_running.png" width="100%" height="100%"/>

Once it's completed, you can check out your [Dockerhub](https://hub.docker.com/repositories).

<img src="{{site.github.url}}/assets/img/jenkins/jenkins_docker_hub.png" width="100%" height="100%"/>

#### Jenkins + Gogs WebHooks

These steps below integrate Jenkins and Gogs so that we can trigger our pipeline after a single push. 

The first thing to do is to generate a token on your profile.

<img src="{{site.github.url}}/assets/img/jenkins/jenkins_token.png" width="100%" height="100%"/>

On the Gogs side, under the repository settings, fill out webhook information as below.

Notice that the field `Secret` should be your token created previously.

<img src="{{site.github.url}}/assets/img/jenkins/gogs_webhook.png" width="100%" height="100%"/>

After this integration, Jenkins will run our pipeline steps when a push into Gogs repository be done.  

#### Conclusion

This post show us a simple example of how to deploy Jenkins as CI server. 

The exemplified pipeline get last changes from our repository, execute Maven lifecicles which includes compiling, unit testing, integration tests, build a docker image and push it to Dockerhub.