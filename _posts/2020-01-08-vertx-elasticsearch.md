---
layout: post
title:  Elasticsearch + VertX
date:   2020-01-08 20:18:00 +0100
category: Dev
tags: vertx java elasticsearch
---

This page contains an example of a "custom logging aggreagator" built with [Eclipse VertX](https://vertx.io/) [Elasticsearch](https://www.elastic.co/).

#### 1. Running Elasticsearch

```bash
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.11.1
```

#### 2. VertX Endpoint

```java
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import org.apache.http.HttpHost;
import org.elasticsearch.action.ActionListener;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.xcontent.XContentType;

import java.io.IOException;
import java.util.UUID;

public class MainVerticle extends AbstractVerticle {

  private static final String INDEX = "chatroom";

  private static final String CONTENT_TYPE = "application/json; charset=utf-8";

  public static void main(String[] args) {
    Vertx vertx = Vertx.vertx();
    vertx.deployVerticle(new MainVerticle());
  }

  @Override
  public void start(Promise<Void> startPromise) throws Exception {

    Router router = Router.router(vertx);
    router.post("/api/logs").handler(BodyHandler.create()).handler(this::create);

    vertx.createHttpServer().requestHandler(router).listen(8888, http -> {

      if (http.succeeded()) {
        startPromise.complete();
        System.out.println("HTTP server started on port 8888");
      } else {
        startPromise.fail(http.cause());
      }

    });
  }

  private void create(RoutingContext routingContext) {

    try {

      RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(new HttpHost("localhost", 9200, "http")));

      JsonObject payload = new JsonObject(routingContext.getBodyAsString());

      indexDocument(client, payload.toString());

      routingContext.response().setStatusCode(201).putHeader("content-type", CONTENT_TYPE).end();

    } catch (Exception e) {
      routingContext.response().setStatusCode(500).end();
    }
  }

  private void indexDocument(final RestHighLevelClient client, final String payload) throws IOException {
    try {
      IndexRequest request = new IndexRequest(INDEX);
      request.id(UUID.randomUUID().toString().replace("-", ""));
      request.source(payload, XContentType.JSON);
      // client.indexAsync(request, RequestOptions.DEFAULT, listener());
      client.index(request, RequestOptions.DEFAULT);
    } catch (Exception e) {
      e.printStackTrace();
      throw e;
    }
  }

  private ActionListener<IndexResponse> listener() {

    return new ActionListener<>() {

      @Override
      public void onResponse(IndexResponse indexResponse) {
        System.out.println(indexResponse);
      }

      @Override
      public void onFailure(Exception e) {
        System.out.println(e.getMessage());
      }
    };
  }

}

```

```java
import io.vertx.core.Vertx;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@ExtendWith(VertxExtension.class)
public class TestMainVerticle {

  private static final String ENDPOINT = "http://localhost:8888/api/logs";

  private static final HttpClient httpClient = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_1_1)
    .connectTimeout(Duration.ofSeconds(10))
    .build();

  @BeforeEach
  void deploy_verticle(Vertx vertx, VertxTestContext testContext) {
    vertx.deployVerticle(new MainVerticle(), testContext.succeeding(id -> testContext.completeNow()));
  }

  @Test
  void post(Vertx vertx, VertxTestContext testContext) throws Throwable {
    String json = new StringBuilder()
      .append("{")
      .append("\"author\":\"Tiago\",")
      .append("\"message\":\"Testing VertX + Elasticsearch.\"")
      .append("}").toString();

    HttpRequest request = HttpRequest.newBuilder()
      .POST(HttpRequest.BodyPublishers.ofString(json))
      .uri(URI.create(ENDPOINT))
      .setHeader("User-Agent", "Java Bot")
      .header("Content-Type", "application/json")
      .build();

    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

    assert response.statusCode() == 201;

    testContext.completeNow();
  }
```

#### 3. Testing

```bash
# Indexing some document via Vertx
curl --header "Content-Type: application/json" --request POST --data '{"author":"Tiago", "message":"Adding on terminal"}' http://localhost:8888/api/logs

# get document by id from Elasticsearch
curl --request GET http://localhost:9200/chatroom/_doc/fb91a8f5d00e452ebbe49152ae4c1f25

# get all documents (top 10 default) from Elasticsearch
curl --request GET http://localhost:9200/chatroom/_search

# Elasticsearch query string search
curl --request GET 'http://localhost:9200/chatroom/_search?q=author:tiago'

# Elasticsearch query DSL
curl --header "Content-Type: application/json" --request GET --data '{"query": {"match": {"author": "tiago"}}}' http://localhost:9200/chatroom/_search
```