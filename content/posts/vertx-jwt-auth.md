+++
title = 'VertX - JWT Auth & MongoDB'
date = 2020-04-27T19:18:41-03:00
draft = false
+++

<a href="https://vertx.io/docs/" target="_blank">Eclipse VertX</a> is a polyglot event-driven application framework that runs on the Java Virtual Machine.


### Example

Let's start creating an RSA certificate. Below there're some examples of how to generate one using Java keytool.

These choices refer to what algorithm the identity provider uses to sign the JWT. Signing is a cryptographic operation that generates a "signature" (part of the JWT) that the recipient of the token can validate to ensure that the token has not been tampered with.

RS256 (RSA Signature with SHA-256) is an asymmetric algorithm, and it uses a public/private key pair: the identity provider has a private (secret) key used to generate the signature, and the consumer of the JWT gets a public key to validate the signature. Since the public key, as opposed to the private key, doesn't need to be kept secured, most identity providers make it easily available for consumers to obtain and use (usually through a metadata URL).

HS256 (HMAC with SHA-256), on the other hand, involves a combination of a hashing function and one (secret) key that is shared between the two parties used to generate the hash that will serve as the signature. Since the same key is used both to generate the signature and to validate it, care must be taken to ensure that the key is not compromised.

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

After generate our private certificate we need to spin up a Mongo database instance to keep our data.

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

In our Java project we'll have this `Constants` class to keep our constants.

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

One message POJO represeting our API response messages.

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

Here the class representing our users.

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

And finally our authorization server implementation example.

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
        JsonObject config = new JsonObject().put("db_name", "demo").put("port", 27017).put("host", "0.0.0.0");
        this.db = MongoClient.createShared(vertx, config);

        // Create our router
        Router router = Router.router(vertx);
        // Enable request body handler
        router.route().handler(BodyHandler.create());

        // Define CORS config
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

        // Set up our JWT object to generate tokens based on our private keystore
        JWTAuthOptions jAuthOptions = new JWTAuthOptions();
        jAuthOptions.setKeyStore(new KeyStoreOptions().setPath("keystore.jceks").setPassword("secret"));
        jwt = JWTAuth.create(vertx, jAuthOptions);

        // All routes /api will be protected
        router.route("/api/*").handler(JWTAuthHandler.create(jwt, "/auth"));
        // Protected route should start with /api
        router.get("/api/users").handler(this::findAllUsers);

        // public routes
        router.post("/auth/login").handler(this::auth);
        router.post("/create-user").handler(this::createUser);        

        // Created our server to listen to
        HttpServer server = vertx.createHttpServer();
        String varPort = System.getenv("PORT");
        int port = varPort == null ? 8002 : Integer.parseInt(varPort);
        LOGGER.info("Application listen on port: %s" + port);
        server.requestHandler(router).listen(port, "0.0.0.0");
    }

    private void auth(RoutingContext routingContext) throws RuntimeException {

        try {

            // Simple validation of the request payload
            if (!Optional.ofNullable(routingContext.getBodyAsString()).isPresent() || routingContext.getBodyAsString().equals("")) {
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
                        JsonObject token = new JsonObject().put("token", jwt.generateToken(sub, new JWTOptions().setExpiresInSeconds(120)));
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

Note that the request header `Authorization: Bearer <token>` should be provided when calling the endpoint.
