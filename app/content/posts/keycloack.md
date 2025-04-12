---
title: 'Spring Boot + Keycloak'
date: "2014-07-03"
draft: false
---

[Keycloak](https://www.keycloak.org/) is an open-source identity and access management (IAM) solution for modern applications and services. Keycloak provides both SAML and OpenID protocol solutions.

Keycloak provides identity and access management, it is also open source. SAML and OpenID protocols are industry standards. Building an application that is integrated with Keycloak will only provide you a more secure and stable solution. There are definitely other solutions available like Gluu, Shibboleth, WSO2.

### Install Keycloak

Download the [KeyClock](https://www.keycloak.org/downloads) and extract it on any directory. 

From the extracted folder, run the below command to start up KeyClock.

```bash
/bin/standalone.sh -Djboss.socket.binding.port-offset=100
```

Once we access the admin console, we should:

- Create a new realm called `SpringBootKeycloakApp`
<img src="/site/images/keycloack/add_realm.png" width="auto" >

- Create a new client application setting the `redirect_uris` to `http://localhost:8080/sso/login`
<img src="/site/images/keycloack/add_app.png" width="auto" >

- Create a new user 
<img src="/site/images/keycloack/add_user.png" width="auto" >

- Set a password for this user on the credentials tab
<img src="/site/images/keycloack/add_user_password.png" width="auto" >

- Create a new role called `user` e.g
<img src="/site/images/keycloack/add_role.png" width="auto" >

- Assign this role for the user
<img src="/site/images/keycloack/assign_role.png" width="auto" >

### Application Code

After define our users and roles as well as realm and client details in Keyloack, 
we can run our application and once we access the protected resource you'll be prompt to input your credentials.

If your input matches the correct credentials you'll be able to acess the protected resource.

`build.gradle`

```groovy
plugins {
	id 'org.springframework.boot' version '2.3.3.RELEASE'
	id 'io.spring.dependency-management' version '1.0.10.RELEASE'
	id 'java'
}

group = 'io.tiago.demo'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '1.8'

repositories {
	mavenCentral()
}

ext {
	set('keycloakVersion', '11.0.2')
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	implementation 'org.springframework.boot:spring-boot-starter-security'
	implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	implementation 'org.springframework.boot:spring-boot-starter-jdbc'
	implementation 'org.keycloak:keycloak-spring-boot-starter'
	runtimeOnly 'mysql:mysql-connector-java'
	testImplementation('org.springframework.boot:spring-boot-starter-test') {
		exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
	}
	testImplementation 'org.springframework.security:spring-security-test'
}

dependencyManagement {
	imports {
		mavenBom "org.keycloak.bom:keycloak-adapter-bom:${keycloakVersion}"
	}
}

test {
	useJUnitPlatform()
}
```

`application.properties`

```sql
spring.datasource.url=jdbc:mysql://127.0.0.1/test?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=12345678
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5Dialect
spring.datasource.hikari.connection-test-query=SELECT 1
###### KEYCLOAK CONFIGURATION
keycloak.auth-server-url=http://localhost:8180/auth
keycloak.realm=SpringBootKeycloakApp
keycloak.resource=SpringBootApp
keycloak.public-client=true
#keycloak.security-constraints[0].authRoles[0]=ROLE_USER
#keycloak.security-constraints[0].securityCollections[0].patterns[0]=/tasks
keycloak.principal-attribute=preferred_username
```

`KeycloakConfig.java`

```java
package io.tiago.demo.config;

import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig
{
    @Bean
    public KeycloakSpringBootConfigResolver keycloakSpringBootConfigResolver()
    {
        return new KeycloakSpringBootConfigResolver();
    }
}
```

`SecurityConfig.java`

```java
package io.tiago.demo.config;


import org.keycloak.adapters.springsecurity.KeycloakConfiguration;
import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationProvider;
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter;
import org.keycloak.adapters.springsecurity.management.HttpSessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;

import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;


@KeycloakConfiguration
public class SecurityConfig extends KeycloakWebSecurityConfigurerAdapter
{
    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder authenticationManagerBuilder)
    {
        SimpleAuthorityMapper simpleAuthorityMapper = new SimpleAuthorityMapper();
        simpleAuthorityMapper.setPrefix("ROLE_");

        KeycloakAuthenticationProvider keycloakAuthenticationProvider =
                keycloakAuthenticationProvider();
        keycloakAuthenticationProvider.setGrantedAuthoritiesMapper(simpleAuthorityMapper);
        authenticationManagerBuilder.authenticationProvider(keycloakAuthenticationProvider);
    }

    @Bean
    @Override
    protected SessionAuthenticationStrategy sessionAuthenticationStrategy ()
    {
        return new RegisterSessionAuthenticationStrategy(new SessionRegistryImpl());
    }

    @Bean
    @Override
    @ConditionalOnMissingBean(HttpSessionManager.class)
    protected HttpSessionManager httpSessionManager()
    {
        return new HttpSessionManager();
    }

    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception
    {
        super.configure(httpSecurity);
        httpSecurity.authorizeRequests()
                .antMatchers("/tasks").hasRole("user")
                .anyRequest().permitAll();
    }
}
```

`TaskController.java`

```java
package io.tiago.demo.controllers;

import io.tiago.demo.dto.TaskDto;
import io.tiago.demo.managers.TaskManager;
import org.keycloak.KeycloakSecurityContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@Controller
public class TaskController
{
    private final HttpServletRequest request;

    @Autowired
    public TaskController(HttpServletRequest request)
    {
        this.request = request;
    }

    @Autowired
    private TaskManager taskManager;

    @GetMapping(value="/")
    public String home()
    {
        return "index";
    }

    @GetMapping(value="/tasks")
    public String getTasks(Model model)
    {
        List<TaskDto> tasks = taskManager.getAllTasks();
        model.addAttribute("tasks", tasks);
        model.addAttribute("name", getKeycloakSecurityContext().getIdToken().getGivenName());

        return "tasks";
    }

    private KeycloakSecurityContext getKeycloakSecurityContext()
    {
        return (KeycloakSecurityContext) request.getAttribute(KeycloakSecurityContext.class.getName());
    }

}
```

`TaskManager.java`

```java
package io.tiago.demo.managers;

import io.tiago.demo.dto.TaskDto;
import io.tiago.demo.models.Task;
import io.tiago.demo.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class TaskManager
{
    @Autowired
    private TaskRepository taskRepository;

    public TaskDto createTask(TaskDto taskDto)
    {
        return null;
    }

    public TaskDto getTask(int id)
    {
        Optional<Task> task = taskRepository.findById(id);
        if(task.isPresent())
        {
            return new TaskDto(task.get());
        }
        else
        {
            return null;
        }
    }

    public List<TaskDto> getAllTasks()
    {
        List<Task> tasks = (List<Task>) taskRepository.findAll();
        List<TaskDto> taskDtos = new ArrayList<>();
        for(Task task: tasks)
        {
            taskDtos.add(new TaskDto(task));
        }
        return taskDtos;
    }
}
```

`Task.java`


```java
package io.tiago.demo.models;

import com.fasterxml.jackson.annotation.JsonFormat;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity(name="Task")
@Table(name = "task")
public class Task implements Serializable
{
    private static final long serialVersionUID = 1L;

    public Task(){}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id", nullable = false)
    private int id;

    @Column(name = "taskname", nullable=false)
    private String taskname;

    @Column(name = "duedate")
    @JsonFormat(pattern="yyyy-MM-dd")
    private Date dueDate;

    @Column(name = "status")
    private String status;

    @Override
    public String toString()
    {
        return "Task = { id = " + id + ", taskname = " + taskname + ", duedate: " + dueDate
                + ", status = " + status + "}";
    }

    public int getId ()
    {
        return id;
    }

    public void setId (int id)
    {
        this.id = id;
    }

    public String getTaskname ()
    {
        return taskname;
    }

    public void setTaskname (String taskname)
    {
        this.taskname = taskname;
    }

    public Date getDueDate ()
    {
        return dueDate;
    }

    public void setDueDate (Date dueDate)
    {
        this.duedate: dueDate;
    }

    public String getStatus ()
    {
        return status;
    }

    public void setStatus (String status)
    {
        this.status = status;
    }
}
```

`TaskRepository.java`

```java
package io.tiago.demo.repositories;

import io.tiago.demo.models.Task;
import org.springframework.data.repository.CrudRepository;

public interface TaskRepository extends CrudRepository<Task, Integer> { }
```

`index.html`

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Homepage</title>
    <!-- Style -->
    <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <style>
        body {
            padding-top: 5rem;
        }
        .starter-template {
            padding: 3rem 1.5rem;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="row">
        <div class="col-lg-8 col-lg-offset-4">
            <p>Welcome to the Task Manager - A simple app to test Keycloak</p>
            <br/><br/>
            <a href="#" th:href="@{/tasks}">Get all tasks</a>
        </div>
    </div>
</div>

</body>
</html>
```

`task.html`

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Tasks</title>
    <!-- Style -->
    <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <style>
        body {
            padding-top: 5rem;
        }
        .starter-template {
            padding: 3rem 1.5rem;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="row">
        <div class="col-lg-12">
            <h2>Tasks for <b th:text="${name}"></b></h2>
            <br/>
            <p th:each="task: ${tasks}" th:text="${task.taskName}"></p>
        </div>
    </div>
</div>
</body>
</html>
```
