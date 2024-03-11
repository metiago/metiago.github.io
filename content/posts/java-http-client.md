+++
title = 'Java Http Client'
date = 2024-03-11T14:30:29-03:00
draft = false
+++

```java
package io.example;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class HttpMain {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    static final  String URL = "http://example.com";
    static final String TOKEN = "xyz";

    private final HttpRequest request = HttpRequest.newBuilder()
            .GET()
            .uri(URI.create(URL))
            .setHeader("Authorization", TOKEN).build();

    public static void main(String[] args) throws Exception {

        HttpMain futures = new HttpMain();

        long start = System.nanoTime();

        ExecutorService e = Executors.newCachedThreadPool();
        List<CompletableFuture<Void>> queue = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            CompletableFuture<Void> cf = CompletableFuture.runAsync(() -> {
                try {
                    futures.call();
                } catch (Exception ex) {
                    throw new RuntimeException(ex);
                }
            }, e);
            queue.add(cf);
        }

        queue.forEach(CompletableFuture::join);

        long end = System.nanoTime();
        long elapsedTime = end - start;
        double seconds = elapsedTime / 1_000_000_000.0;
        System.out.println("Time at: " + seconds);
    }

    private void call() throws Exception {
        System.out.println("Calling...");
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        //System.out.println(response.statusCode());
        //System.out.println(response.body());
    }
}