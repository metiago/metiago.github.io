---
title: 'Spring Security - OAuth2'
date: "2014-07-03"
draft: false
---

This guide walks you through the steps for creating Restful API with Spring using Oauth2 to manage authorization.

### Example

The application is pretty simple, it's just fetch some users from database using `Spring Data`. Each endpoints' security is controlled by `Spring Security`
based on the OAuth2 scope that logged users have.

`pom.xml`
```java
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>spring-swagger-oauth2</groupId>
    <artifactId>spring-swagger-oauth2</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>1.8</maven.compiler.source>
        <maven.compiler.target>1.8</maven.compiler.target>
        <swagger.version>2.9.2</swagger.version>
    </properties>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.1.RELEASE</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger2</artifactId>
            <version>${swagger.version}</version>
        </dependency>
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger-ui</artifactId>
            <version>${swagger.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.security.oauth</groupId>
            <artifactId>spring-security-oauth2</artifactId>
            <version>2.5.1.RELEASE</version>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
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

All files below will be executed by Spring during start up. It should be in the Java's resource folder of the project.

`application.properties`
```xml
# LOGGING LEVEL
logging.level.org.springframework.web = DEBUG

# DB PROPERTIES:
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/test
spring.datasource.username=root
spring.datasource.password=12345678

# HIBERNATE CONFIGURATION:
hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
hibernate.show_sql=true
hibernate.hbm2ddl.auto=update
```

`data.sql`
```sql
insert into users (user_id, username, password, first_name, last_name, admin) values (1, 'tiago', '$2a$10$15CmMwDjGYlYsTN8Y/.1S.770GqiKtIaHa.lLoI1AnYe4Lp1Ie8C6', 'Tiago', 'Souza', false);
insert into users (user_id, username, password, first_name, last_name, admin) values (2, 'ziggy', '$2a$10$15CmMwDjGYlYsTN8Y/.1S.770GqiKtIaHa.lLoI1AnYe4Lp1Ie8C6', 'Ziggy', 'Zagg', false);
insert into users (user_id, username, password, first_name, last_name, admin) values (3, 'bapi', '$2a$10$15CmMwDjGYlYsTN8Y/.1S.770GqiKtIaHa.lLoI1AnYe4Lp1Ie8C6', 'Bapi', 'Any', false);
insert into users (user_id, username, password, first_name, last_name, admin) values (4, 'john', '$2a$10$15CmMwDjGYlYsTN8Y/.1S.770GqiKtIaHa.lLoI1AnYe4Lp1Ie8C6', 'John', 'Duo', false);
insert into users (user_id, username, password, first_name, last_name, admin) values (5, 'peter', '$2a$10$15CmMwDjGYlYsTN8Y/.1S.770GqiKtIaHa.lLoI1AnYe4Lp1Ie8C6', 'Peter', 'Saint', false);
insert into users (user_id, username, password, first_name, last_name, admin) values (6, 'admin', '$2a$10$JQOfG5Tqnf97SbGcKsalz.XpDQbXi1APOf2SHPVW27bWNioi9nI8y', 'Super', 'Admin', true);
```

`schema.sql`
```sql
CREATE TABLE users (
	USER_ID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
	USERNAME VARCHAR(40) NOT NULL,
	PASSWORD VARCHAR(255) NOT NULL,
	FIRST_NAME VARCHAR(40) NOT NULL,
	LAST_NAME VARCHAR(40) NOT NULL,
	ADMIN BOOLEAN
);
```

Now we have our endpoints implemented and documented with Swagger.

`UserApi.java`

```java
package io.tiago.oauth.api.v1;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import io.tiago.oauth.entity.User;
import io.tiago.oauth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Api(value = "User API V1")
@RequestMapping(value = "/v1/api")
public class UserApi {

    @Autowired
    private UserService userService;

    @ApiOperation(value = "Simple text", notes = "This endpoint returns simple message - without authentication", response = User.class)
    @ApiResponses(value = {@ApiResponse(code = 200, message = "", response = User[].class), @ApiResponse(code = 500, message = "Exception", response = Exception.class)})
    @GetMapping(value = "/get", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<User> findAll() throws Exception {
        return new ResponseEntity<>(userService.findAll().stream().findAny().get(), HttpStatus.OK);
    }
}
```

This endpoint (v2) contains Spring's annotation `@PreAuthorize("#oauth2.hasScope('read')")` which means only users with `read` scopes can read it.

```java
package io.tiago.oauth.api.v2;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import io.tiago.oauth.entity.User;
import io.tiago.oauth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("UserControllerV2")
@Api(value = "User API V2 Description")
@RequestMapping(value = "/v2/api")
public class UserApi {

    @Autowired
    private UserService userService;

    @ApiOperation(value = "List all users", notes = "List all users", response = User.class)
    @ApiResponses(value = {@ApiResponse(code = 200, message = "", response = User[].class), @ApiResponse(code = 500, message = "Some app arror", response = Exception.class)})
    @RequestMapping(value = "/list", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("#oauth2.hasScope('read')")
    public ResponseEntity<List<User>> list() throws Exception {
        List<User> users = userService.findAll();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
}
```

The endpoint (v3) contains Spring's annotation `@PreAuthorize("#oauth2.hasScope('write')")` which means only users with `write` scopes can write to the database.

```java
package io.tiago.oauth.api.v3;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import io.tiago.oauth.entity.User;
import io.tiago.oauth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController("UserControllerV3")
@Api(value = "User API V3 Description")
@RequestMapping(value = "/v3/api", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
public class UserApi {

    @Autowired
    private UserService userService;

    @ApiOperation(value = "Add a user", notes = "This method add some user to database", response = User.class)
    @ApiResponses(value = {@ApiResponse(code = 201, message = "User created successfully", response = User.class), @ApiResponse(code = 500, message = "Some error on add a new user", response = Exception.class)})
    @RequestMapping(value = "/add", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("#oauth2.hasScope('write')")
    public ResponseEntity<User> add(@RequestBody User user) throws Exception {
        userService.add(user);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}
```

JPA entity represeting our database table.

```java
package io.tiago.oauth.entity;

import org.hibernate.validator.constraints.NotEmpty;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "users")
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    @Column(name = "USER_ID")
    private Integer id;

    @Column(name = "USERNAME")
    @NotEmpty(message = "Username can not be empty")
    private String username;

    @Column(name = "PASSWORD")
    @NotEmpty(message = "Password can not be empty")
    private String password;

    @Column(name = "FIRST_NAME")
    @NotEmpty(message = "Firstname can not be empty")
    private String firstName;

    @Column(name = "LAST_NAME")
    @NotEmpty(message = "Lastname can not be empty")
    private String lastName;

    @Column(name = "ADMIN")
    private boolean admin;

    public User() {}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }
}
```

`UserRepository.java` is our `Spring Data` repository.

```java
package io.tiago.oauth.repository;

import io.tiago.oauth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {

    User findByUsername(String username);

}
```

`UserCredentials.java` 

```java
package io.tiago.oauth.service;

import io.tiago.oauth.entity.User;
import io.tiago.oauth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class UserCredentials implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username);

        if (user == null) {
            throw new UsernameNotFoundException(String.format("User with the username %s doesn't exist", username));
        }

        List<GrantedAuthority> authorities = new ArrayList<>();

        if (user.isAdmin()) {
            authorities = AuthorityUtils.createAuthorityList("ROLE_ADMIN");
        }

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), authorities);

        return userDetails;
    }
}
```

`UserService.java`

```java
package io.tiago.oauth.service;

import io.tiago.oauth.entity.User;
import io.tiago.oauth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

	@Autowired
	private UserRepository userRepository;
	
	@Transactional
	public void add(User u) {
		userRepository.save(u);		
	}
		
	public List<User> findAll() {
		return userRepository.findAll();
	}

	@Transactional
	public void delete(Integer uid) {
		userRepository.deleteById(uid);
	}

	public Optional<User> findOne(Integer uid) {
		return userRepository.findById(uid);
	}
}
```

`Constants.java`
```java
package io.tiago.oauth.config;

public class Constants {

    public static final String CLIENT_ID = "souzaClientID";

    public static final String CLIENT_SECRET = "souzaSecret";

    public static final String V1_PKG = "io.tiago.oauth.api.v1";

    public static final String V2_PKG = "io.tiago.oauth.api.v2";

    public static final String V3_PKG = "io.tiago.oauth.api.v3";

    public static final String SCAN_PKG = "io.tiago.oauth.*";

    public static final String SWAGGER_API_DESCRIPTION = "This is a Restful API to demonstrate Spring Security OAuth2. " +
            "This example use authorization code as grant type."
            + "<br/> Click here https://metiago.github.io to log in.";
}
```

```java
package io.tiago.oauth.config;

import org.aopalliance.intercept.MethodInvocation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.provider.expression.OAuth2ExpressionParser;
import org.springframework.security.oauth2.provider.expression.OAuth2SecurityExpressionMethods;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(new BCryptPasswordEncoder());
    }

    @Override
    @Bean
    protected AuthenticationManager authenticationManager() throws Exception {
        return super.authenticationManager();
    }

    @Override
    @Order(Ordered.HIGHEST_PRECEDENCE)
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests().antMatchers("/v1/**", "/swagger-ui/**", "/api-docs/**").permitAll().and().formLogin();
        http.csrf().disable();
    }

    @EnableGlobalMethodSecurity(prePostEnabled = true)
    static class MethodSecurityConfig extends GlobalMethodSecurityConfiguration {
        @Override
        protected MethodSecurityExpressionHandler createExpressionHandler() {
            return new OAuth2MethodSecurityExpressionHandler();
        }
    }

    private static class OAuth2MethodSecurityExpressionHandler extends DefaultMethodSecurityExpressionHandler {
        public OAuth2MethodSecurityExpressionHandler() {
            setExpressionParser(new OAuth2ExpressionParser(getExpressionParser()));
        }

        @Override
        public StandardEvaluationContext createEvaluationContextInternal(Authentication authentication, MethodInvocation mi) {
            final StandardEvaluationContext ec = super.createEvaluationContextInternal(authentication, mi);
            final OAuth2SecurityExpressionMethods methods = new OAuth2SecurityExpressionMethods(authentication);
            ec.setVariable("oauth", methods);
            ec.setVariable("oauth2", methods);
            return ec;
        }
    }
}
```

`ResourceServerConfig.java`

```java
package io.tiago.oauth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;

@Configuration
@EnableResourceServer
public class ResourceServerConfig extends ResourceServerConfigurerAdapter {

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) {
        resources.resourceId("Souza-OAuth2").stateless(true);
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.requestMatchers().antMatchers("/v2/**")
                .and().authorizeRequests().antMatchers("/list").access("#oauth2.hasScope('read')");
        http.requestMatchers().antMatchers("/v3/**")
                .and().authorizeRequests().antMatchers("/add").access("#oauth2.hasScope('write')");
    }
}
```

`AuthorizationServerConfig.java`

```java
package io.tiago.oauth.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;

import static io.tiago.oauth.config.Constants.CLIENT_ID;
import static io.tiago.oauth.config.Constants.CLIENT_SECRET;

@Configuration
@EnableAuthorizationServer
public class AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter {

    private final String[] REDIRECT_URI = new String[]{"http://localhost:8080/home",
                                                       "https://oauth.pstmn.io/v1/callback",
                                                       "http://localhost:8080/webjars/springfox-swagger-ui/oauth2-redirect.html"};

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
        endpoints.authenticationManager(this.authenticationManager);
    }

    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {

        clients.inMemory().withClient(CLIENT_ID)
                .secret("{noop}"+CLIENT_SECRET)
                .authorizedGrantTypes("password", "authorization_code", "refresh_token")
                .scopes("read", "write")
                .resourceIds("Souza-OAuth2")
                .redirectUris(REDIRECT_URI)
                .refreshTokenValiditySeconds(360)
                .accessTokenValiditySeconds(360);
    }
}
```

`SwaggerConfig.java`

```java
package io.tiago.oauth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.*;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger.web.SecurityConfiguration;
import springfox.documentation.swagger.web.SecurityConfigurationBuilder;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static io.tiago.oauth.config.Constants.CLIENT_ID;
import static io.tiago.oauth.config.Constants.CLIENT_SECRET;

@Configuration
@EnableSwagger2
public class SwaggerConfig {

    @Bean
    public Docket swaggerSettingsEndpointV1() {

        return new Docket(DocumentationType.SWAGGER_2)
                .groupName("Users_v1")
                .select()
                .apis(RequestHandlerSelectors.basePackage(Constants.V1_PKG))
                .paths(PathSelectors.any())
                .build()
                .apiInfo(apiInfo());
    }

    @Bean
    public Docket swaggerSettingsEndpointV2() {

        return new Docket(DocumentationType.SWAGGER_2)
                .groupName("Users_V2")
                .select()
                .apis(RequestHandlerSelectors.basePackage(Constants.V2_PKG))
                .paths(PathSelectors.any())
                .build()
                .securitySchemes(Collections.singletonList(securitySchema()))
                .securityContexts(Collections.singletonList(securityContext())).pathMapping("/")
                .apiInfo(apiInfo());
    }

    @Bean
    public Docket swaggerSettingsEndpointV3() {

        return new Docket(DocumentationType.SWAGGER_2)
                .groupName("Users_V3")
                .select()
                .apis(RequestHandlerSelectors.basePackage(Constants.V3_PKG))
                .paths(PathSelectors.any())
                .build()
                .securitySchemes(Collections.singletonList(securitySchema()))
                .securityContexts(Collections.singletonList(securityContext())).pathMapping("/")
                .apiInfo(apiInfo());
    }

    private ApiInfo apiInfo() {
        Contact contact = new Contact("Mr. Souza", "https://metiago.github.io", "mesouza@gmail.com");
        ApiInfo apiInfo = new ApiInfo("ZBX2", Constants.SWAGGER_API_DESCRIPTION,
                "0.1.0", "Terms of service",
                contact,
                "Apache 2.0",
                "https://www.apache.org/licenses/LICENSE-2.0", Collections.emptyList());
        return apiInfo;
    }

    @Bean
    public SecurityConfiguration security() {
        return SecurityConfigurationBuilder.builder()
                .clientId(CLIENT_ID)
                .clientSecret(CLIENT_SECRET)
                .useBasicAuthenticationWithAccessCodeGrant(true)
                .build();
    }

    private SecurityContext securityContext() {
        return SecurityContext.builder()
                .securityReferences(defaultAuth())
                .forPaths(PathSelectors.regex("/v2.*"))
                .forPaths(PathSelectors.regex("/v3.*"))
                .build();
    }

    private OAuth securitySchema() {
        List<AuthorizationScope> authorizationScopeList = new ArrayList();
        authorizationScopeList.add(new AuthorizationScope("read", "read all"));
        authorizationScopeList.add(new AuthorizationScope("write", "write all"));
        List<GrantType> grantTypes = new ArrayList();
        GrantType creGrant = new AuthorizationCodeGrant(new TokenRequestEndpoint("/oauth/authorize", CLIENT_ID, CLIENT_SECRET), new TokenEndpoint("/oauth/token", "my_token"));
        grantTypes.add(creGrant);
        return new OAuth("oauth2schema", authorizationScopeList, grantTypes);
    }

    private List<SecurityReference> defaultAuth() {
        final AuthorizationScope[] authorizationScopes = new AuthorizationScope[2];
        authorizationScopes[0] = new AuthorizationScope("read", "read all");
        authorizationScopes[1] = new AuthorizationScope("write", "write all");
        return Collections.singletonList(new SecurityReference("oauth2schema", authorizationScopes));
    }
}
```

`AppConfig.java`

```java
package io.tiago.oauth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableTransactionManagement
@ComponentScan({Constants.SCAN_PKG})
@EnableJpaRepositories(Constants.SCAN_PKG)
public class AppConfig implements WebMvcConfigurer {

    private static final String[] CLASSPATH_RESOURCE_LOCATIONS = {
            "classpath:/META-INF/resources/", "classpath:/resources/",
            "classpath:/static/", "classpath:/public/"};

    @Bean
    public WebMvcConfigurer corsConfigurer() {

        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("POST", "PUT", "DELETE", "GET", "OPTIONS")
                        .allowedHeaders("content-type", "Authorization")
                        .exposedHeaders("content-type", "Authorization")
                        .allowCredentials(false).maxAge(3600);
            }
        };
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        if (!registry.hasMappingForPattern("/webjars/**")) {
            registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");
        }

        if (!registry.hasMappingForPattern("/**")) {
            registry.addResourceHandler("/**").addResourceLocations(CLASSPATH_RESOURCE_LOCATIONS);
        }
    }
}

```

`Server.java`

```java
package io.tiago.oauth;

import io.tiago.oauth.config.AppConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.Import;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
@Import({AppConfig.class})
public class Server {

    public static void main(String[] args) {
        SpringApplication.run(Server.class, args);
    }
}
```
