---
title: 'VertX - JWT Auth & MongoDB'
date: 2017-04-27T19:18:41-03:00
draft: false
---

This project is a RESTful API built with Eclipse Vert.x that implements JWT authentication for secure access control. The backend uses MongoDB to store user data and other relevant information. Users can register, log in, and receive a JWT token, which is required to access protected endpoints. The Vert.x framework handles the JWT authentication, ensuring that only authorized users can perform certain actions, while MongoDB provides a scalable and flexible database solution. The project emphasizes high performance, scalability, and security.

### Cryptographic keys

These choices determine how the identity provider signs the JWT. Signing is a process that creates a "signature" (part of the JWT) so the recipient can verify that the token hasn’t been altered.

RS256 (RSA Signature with SHA-256) is an asymmetric algorithm that uses a public/private key pair. The identity provider uses a private key to sign the JWT, and the recipient uses a public key to verify it. The public key is usually easily accessible through a metadata URL.

HS256 (HMAC with SHA-256) is a symmetric algorithm that uses a shared secret key for both signing and verifying the JWT. Since the same key is used for both, it's important to keep the key secure to prevent it from being compromised.

```bash
keytool -genseckey -keystore keystore.jceks -storetype jceks -storepass secret -keyalg HMacSHA256 -keysize 2048 -alias HS256 -keypass secret
keytool -genseckey -keystore keystore.jceks -storetype jceks -storepass secret -keyalg HMacSHA384 -keysize 2048 -alias HS384 -keypass secret
keytool -genseckey -keystore keystore.jceks -storetype jceks -storepass secret -keyalg HMacSHA512 -keysize 2048 -alias HS512 -keypass secret
keytool -genkey -keystore keystore.jceks -storetype jceks -storepass secret -keyalg RSA -keysize 2048 -alias RS256 -keypass secret -sigalg SHA256withRSA -dname "CN=,OU=,O=,L=,ST=,C=" -validity 360
keytool -genkey -keystore keystore.jceks -storetype jceks -storepass secret -keyalg RSA -keysize 2048 -alias RS384 -keypass secret -sigalg SHA384withRSA -dname "CN=,OU=,O=,L=,ST=,C=" -validity 360
keytool -genkey -keystore keystore.jceks -storetype jceks -storepass secret -keyalg RSA -keysize 2048 -alias RS512 -keypass secret -sigalg SHA512withRSA -dname "CN=,OU=,O=,L=,ST=,C=" -validity 360
keytool -genkeypair -keystore keystore.jceks -storetype jceks -storepass secret -keyalg EC -keysize 256 -alias ES256 -keypass secret -sigalg SHA256withECDSA -dname "CN=,OU=,O=,L=,ST=,C=" -validity 360
keytool -genkeypair -keystore keystore.jceks -storetype jceks -storepass secret -keyalg EC -keysize 256 -alias ES384 -keypass secret -sigalg SHA384withECDSA -dname "CN=,OU=,O=,L=,ST=,C=" -validity 360
keytool -genkeypair -keystore keystore.jceks -storetype jceks -storepass secret -keyalg EC -keysize 256 -alias ES512 -keypass secret -sigalg SHA512withECDSA -dname "CN=,OU=,O=,L=,ST=,C=" -validity 360l
```

### MongoDB Set up

```yaml
version: '3.5'
services:
  mongo:
    image: "mongo:4.0.2"
    ports:
      - "27017:27017"
    command: --profile=1 --slowms=0

  mongo-express:
    image: "mongo-express:0.49.0"
    ports:
      - "8081:8081"
    depends_on:
      - mongo
```

### Code Sample

```java
package com.tiago.auth;

public class Constants {

    public static final String APPLICATION_TYPE = "application/json";

    public static final String MSG_OK = "Data has been saved successfully";

    public static final String MSG_BAD_REQUEST = "Invalid request body";

    public static final String BODY_NOT_EMPTY = "Body must be not empty";

    public static final String USERS_COL = "users";
}
```




```java
package com.tiago.auth;

import java.io.Serializable;

public class Message implements Serializable {

    private String message;

    private Object body;

    public Message() {
    }

    public Message(String message) {
        this.message = message;
    }

    public Message(String message, Object body) {
        this.message = message;
        this.body = body;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getBody() {
        return body;
    }

    public void setBody(Object body) {
        this.body = body;
    }
}
```


```java
package com.tiago.auth;

import java.io.Serializable;

public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    private String name;

    private String username;

    private String password;

    public User() {
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public User(String name, String username, String password) {
        this.setName(name);
        this.setUsername(username);
        this.setPassword(password);
    }
}
```



```java
package com.tiago.auth;

import com.google.common.net.HttpHeaders;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServer;
import io.vertx.core.impl.FailedFuture;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.KeyStoreOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTAuthOptions;
import io.vertx.ext.auth.jwt.JWTOptions;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.JWTAuthHandler;
import io.vertx.ext.web.handler.StaticHandler;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;


public class AuthServer extends AbstractVerticle {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthServer.class);

    private MongoClient db;

    private JWTAuth jwt;

    public static void main(String[] args) {
        Vertx vertx = Vertx.vertx();
        vertx.deployVerticle(new AuthServer());
    }

    @Override
    public void start() {

        // Set up Mongo DB client - It can be loaded from an externa file or env vars
        JsonObject config = new JsonObject()
        .put("db_name", "demo")
        .put("port", 27017)
        .put("host", "0.0.0.0");

        this.db = MongoClient.createShared(vertx, config);

        // create our router
        Router router = Router.router(vertx);
        // enable request body handler
        router.route().handler(BodyHandler.create());

        // set CORS
        Set<String> allowedHeaders = new HashSet<>();
        allowedHeaders.add("Access-Control-Allow-Origin");
        allowedHeaders.add("Content-Type");
        allowedHeaders.add("accept");

        Set<HttpMethod> allowedMethods = new HashSet<>();
        allowedMethods.add(HttpMethod.GET);
        allowedMethods.add(HttpMethod.POST);
        allowedMethods.add(HttpMethod.DELETE);
        allowedMethods.add(HttpMethod.OPTIONS);
        router.route().handler(CorsHandler.create("*")
        .allowedHeaders(allowedHeaders)
        .allowedMethods(allowedMethods));

        // set up JWT object to generate tokens based on our private keystore
        JWTAuthOptions jAuthOptions = new JWTAuthOptions();
        jAuthOptions.setKeyStore(new KeyStoreOptions().setPath("keystore.jceks")
        .setPassword("secret"));
        
        jwt = JWTAuth.create(vertx, jAuthOptions);

        // All routes /api will be protected
        router.route("/api/*").handler(JWTAuthHandler.create(jwt, "/auth"));
        // Protected route should start with /api
        router.get("/api/users").handler(this::findAllUsers);

        // public routes
        router.post("/auth/login").handler(this::auth);
        router.post("/create-user").handler(this::createUser);        

        HttpServer server = vertx.createHttpServer();
        String varPort = System.getenv("PORT");
        int port = varPort == null ? 8002 : Integer.parseInt(varPort);
        LOGGER.info("Application listen on port: %s" + port);
        server.requestHandler(router).listen(port, "0.0.0.0");
    }

    private void auth(RoutingContext routingContext) throws RuntimeException {

        try {

            // simple validation of the request payload
            if (!Optional.ofNullable(routingContext.getBodyAsString()).isPresent() 
                || routingContext.getBodyAsString().equals("")) {
                
                routingContext.response().setStatusCode(400).end();
            }

            // decode json into our object
            final User user = Json.decodeValue(routingContext.getBodyAsString(), User.class);

            // MongoDB query params
            JsonObject query = new JsonObject();
            query.put("username", user.getUsername());

            this.db.findOne(Constants.USERS_COL, query, new JsonObject(), res -> {

                if (res.succeeded()) {

                    JsonObject row = res.result();

                    if (row != null) {

                        final String password = row.getString("password");

                        if (!BCrypt.checkpw(user.getPassword(), password)) {
                            routingContext.response().setStatusCode(401).end();
                        }

                        JsonObject sub = new JsonObject();
                        sub.put("sub", row.getString("User"));
                        JsonObject token = new JsonObject().put("token", jwt.generateToken(sub, 
                        new JWTOptions().setExpiresInSeconds(120)));
                        
                        routingContext.response().putHeader("Content-Type", "application/json");
                        routingContext.response().end(Json.encodePrettily(token));
                    }

                } else {
                    LOGGER.error(((FailedFuture) res).cause().getMessage());
                    routingContext.response().putHeader(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_TYPE).setStatusCode(500).end();
                }

            });

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            routingContext.response().putHeader(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_TYPE).setStatusCode(500).end();
        }
    }

    private void createUser(RoutingContext routingContext) {

        String body = routingContext.getBodyAsString();

        if ("".equals(body)) {
            routingContext.response().putHeader(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_TYPE).setStatusCode(400).end(JsonHelper.encodePrettily(new Message(Constants.BODY_NOT_EMPTY)));
            return;
        }

        try {

            User User = (User) JsonHelper.readValue(body, User.class);

            JsonObject data = new JsonObject();
            data.put("name", User.getName());
            data.put("username", User.getUsername());
            data.put("password", BCrypt.hashpw(User.getPassword(), BCrypt.gensalt(10)));

            this.db.insert(Constants.USERS_COL, data, res -> {

                if(res.succeeded()) {
                    routingContext.response().putHeader(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_TYPE).setStatusCode(200).end(JsonHelper.encodePrettily(new Message("User created successfully")));
                } else {
                    LOGGER.error(((FailedFuture) res).cause().getMessage());
                    routingContext.response().putHeader(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_TYPE).setStatusCode(500).end();
                }
            });

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            routingContext.response().putHeader(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_TYPE).setStatusCode(500).end();
        }
    }

    private void findAllUsers(RoutingContext routingContext) {

        try {

            this.db.find(Constants.USERS_COL, new JsonObject(), res -> {

                if(res.succeeded()) {
                    List<JsonObject> result = res.result();
                    routingContext.response().putHeader(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_TYPE).setStatusCode(200).end(JsonHelper.encodePrettily(result));
                } else {
                    LOGGER.error(((FailedFuture) res).cause().getMessage());
                    routingContext.response().putHeader(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_TYPE).setStatusCode(500).end();
                }
            });

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            routingContext.response().putHeader(HttpHeaders.CONTENT_TYPE, Constants.APPLICATION_TYPE).setStatusCode(500).end();
        }
    }
}
```

PS: `Authorization: Bearer <token>` should be provided when calling the endpoint.
