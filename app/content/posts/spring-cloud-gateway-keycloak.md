---
title:  'Spring Cloud Gateway + Keycloak'
date: "2014-07-03"
draft: false
---

API Gateway is a type of service in a micro services architecture which provides an edge layer for clients to communicate with internal services. 
The Gateway can route requests, transform protocols, aggregate data and implement logics like authentication and rate-limiters.

`Spring Cloud Gatway` is the next evolution of <a href="https://cloud.spring.io/spring-cloud-netflix/multi/multi__router_and_filter_zuul.html" target="_blank">Zuul</a>, it contains a lot of new features and thay can be found <a href="https://spring.io/blog/2021/02/23/spring-tips-spring-cloud-gateway-redux" target="_blank">here</a>.

This guide is contains a simple example of how to set up `Spring Cloud Gateway` integrating with `Keycloak`, so that we can use OAuth2 features to protect
our edge service and all our micro sercives behind it.

### Keycloak Set Up

Before the code sample, we have to configure our application client, secrets and realms in Keycloak.

```bash
docker run -p 8080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin quay.io/keycloak/keycloak:15.0.2
```

Add a new user and set its password.

<img src="/site/images/spring-cloud/gateway-keycloack/add-user.png" width="auto" >

<img src="/site/images/spring-cloud/gateway-keycloack/add-user-password.png" width="auto" >

Create a realm.

<img src="/site/images/spring-cloud/gateway-keycloack/add-realm.png" width="auto" >

Create a client scope.

<img src="/site/images/spring-cloud/gateway-keycloack/client-scope.png" width="auto" >

Create two clients with the same configuration, one called `has-game-scope` and other called `no-game-scope`.

<img src="/site/images/spring-cloud/gateway-keycloack/add-client.png" width="auto" >

Assign the scope `GAME` for the client called `has-game-scope`.

<img src="/site/images/spring-cloud/gateway-keycloack/assign-scope.png" width="auto" >

That's it! We have our Keycloak ready to authenticate users.

### Code Example - Gateway

`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
		 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.3.4.RELEASE</version>
		<relativePath/>
	</parent>
	<modelVersion>4.0.0</modelVersion>

	<artifactId>gateway</artifactId>

	<properties>
		<java.version>11</java.version>
		<spring-cloud.version>Hoxton.SR8</spring-cloud.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-oauth2-client</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-starter-gateway</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-starter-security</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
			<exclusions>
				<exclusion>
					<groupId>org.junit.vintage</groupId>
					<artifactId>junit-vintage-engine</artifactId>
				</exclusion>
			</exclusions>
		</dependency>
	</dependencies>
	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>org.springframework.cloud</groupId>
				<artifactId>spring-cloud-dependencies</artifactId>
				<version>${spring-cloud.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>
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

`application.yml`

```yaml
spring:
  application:
    name: gateway
  cloud:
    gateway:
      default-filters:
        - TokenRelay
      routes:
        - id: game-api
          uri: http://localhost:9091
          predicates:
            - Path=/game/**
          filters:
            - RemoveRequestHeader=Cookie
  security:
    oauth2:
      client:
        provider:
          keycloak:
            token-uri: http://localhost:8080/auth/realms/SpringBootKeycloakApp/protocol/openid-connect/token
            authorization-uri: http://localhost:8080/auth/realms/SpringBootKeycloakApp/protocol/openid-connect/auth
            userinfo-uri: http://localhost:8080/auth/realms/SpringBootKeycloakApp/protocol/openid-connect/userinfo
            user-name-attribute: preferred_username
        registration:
          has-scope:
            provider: keycloak
            client-id: has-game-scope
            client-secret: <my-has-game-scope-secret>
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/keycloak"
          no-scope:
            provider: keycloak
            client-id: no-game-scope
            client-secret: <my-no-scope-secret>
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/keycloak"

server.port: 9090

logging.level:
  org.springframework.cloud.gateway: DEBUG
  org.springframework.security: DEBUG
  org.springframework.web.reactive.function.client: TRACE
```

`SecurityConfig.java` this is our tradional Spring Security configuration class.

```java
package io.tiago.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

	@Bean
	public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
		http.authorizeExchange(exchanges -> exchanges.anyExchange().authenticated())
			.oauth2Login(withDefaults());
		http.csrf().disable();
		return http.build();
	}

}
```

`GatewayApplication.java` this is our main class with two demo endpoints.

```java
package io.tiago;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.WebSession;

import reactor.core.publisher.Mono;

@SpringBootApplication
@RestController
public class GatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
	}

	@GetMapping(value = "/token")
	public Mono<String> getHome(@RegisteredOAuth2AuthorizedClient OAuth2AuthorizedClient authorizedClient) {
		return Mono.just(authorizedClient.getAccessToken().getTokenValue());
	}

	@GetMapping("/")
	public Mono<String> index(WebSession session) {
		return Mono.just(session.getId());
	}

}
```

### Code Example - Game API

`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
		 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.3.4.RELEASE</version>
		<relativePath/>
	</parent>
	<modelVersion>4.0.0</modelVersion>

	<artifactId>game</artifactId>

	<properties>
		<java.version>11</java.version>
		<spring-cloud.version>Hoxton.SR8</spring-cloud.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.security</groupId>
			<artifactId>spring-security-oauth2-resource-server</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.security</groupId>
			<artifactId>spring-security-oauth2-jose</artifactId>
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

`application.yml`

```yaml
spring:
  application:
    name: game-api
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/auth/realms/SpringBootKeycloakApp

logging.level:
  org.springframework.cloud.gateway: DEBUG
  org.springframework.security: DEBUG
  org.springframework.web.reactive.function.client: TRACE

server.port: 9091
```

`SecurityConfig.java`

```java
package io.tiago.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	protected void configure(HttpSecurity http) throws Exception {
		http.authorizeRequests(authorize -> authorize.anyRequest().authenticated())
				.oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);
	}
}
```

`GameController.java`

```java
package io.tiago.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/game")
public class GameController {

	@PreAuthorize("hasAuthority('SCOPE_GAME')")
	@GetMapping("/ping")
	public String ping() {
		return "pong";
	}
}
```

`GameApplication.java`

```java
package io.tiago;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GameApplication {

	public static void main(String[] args) {
		SpringApplication.run(GameApplication.class, args);
	}

}
```

### Workflow

Accessing `http://localhost:9090`, Spring Boot prompts a login page asking for the scopes you want to use 
and based on what you choose, you be able to access the protected endpoint.

<img src="/site/images/spring-cloud/gateway-keycloack/diagram.png" width="auto" >

