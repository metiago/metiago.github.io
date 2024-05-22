package org.acme;

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
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class App {

        private static final ExecutorService executorService = Executors.newFixedThreadPool(4);

        private static final HttpClient httpClient = HttpClient.newBuilder()
                        .executor(executorService)
                        .version(HttpClient.Version.HTTP_2)
                        .connectTimeout(Duration.ofSeconds(2))
                        .build();

        public static void main(String[] args) {

                long start = System.nanoTime();

                List<String> targets = new ArrayList<>();
                IntStream.range(33000, 33401).forEach(i -> {
                        targets.add("https://api.zippopotam.us/us/" + i);
                });

                List<CompletableFuture<String>> result = targets.stream()
                                .map(url -> httpClient.sendAsync(
                                                HttpRequest.newBuilder(URI.create(url))
                                                                .GET()
                                                                .setHeader("User-Agent", "Java 11 HttpClient Bot")
                                                                .build(),
                                                HttpResponse.BodyHandlers.ofString())
                                                .thenApply(response -> response.body()))
                                .collect(Collectors.toList());

                for (CompletableFuture<String> future : result) {
                        try {
                                System.out.println(future.get());
                        } catch (InterruptedException | ExecutionException e) {
                        }
                }

                // https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html
                executorService.shutdown();

                long end = System.nanoTime();
                long elapsedTime = end - start;
                double seconds = elapsedTime / 1_000_000_000.0;
                System.out.println("Time at: " + seconds);
        }
}
