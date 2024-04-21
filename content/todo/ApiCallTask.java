package org.acme;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.RecursiveTask;
import java.util.stream.IntStream;

public class ApiCallTask extends RecursiveTask<String> {

    private static final int THRESHOLD = 2; // Threshold for splitting the task
    private List<String> apiUrls;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(2))
            .build();

    public ApiCallTask(List<String> apiUrls) {
        this.apiUrls = apiUrls;
    }

    @Override
    protected String compute() {
        System.out.println("Calling..." + Thread.currentThread());
        if (apiUrls.size() <= THRESHOLD) {
            // If the number of API calls is small enough, call them sequentially
            StringBuilder result = new StringBuilder();
            for (String url : apiUrls) {
                result.append(callApi(url)).append("\n");
            }
            return result.toString();
        } else {
            // Split the task into subtasks
            int mid = apiUrls.size() / 2;
            List<String> leftUrls = apiUrls.subList(0, mid);
            List<String> rightUrls = apiUrls.subList(mid, apiUrls.size());

            // Create subtasks
            ApiCallTask leftTask = new ApiCallTask(leftUrls);
            ApiCallTask rightTask = new ApiCallTask(rightUrls);

            // Fork the subtasks
            leftTask.fork();
            rightTask.fork();

            // Join the results of subtasks
            String leftResult = leftTask.join();
            String rightResult = rightTask.join();

            // Combine the results
            return leftResult + rightResult;
        }
    }

    private String callApi(String url) {
        // Simulate calling an external API
        // Replace this with your actual API call implementation
        // You can use libraries like HttpClient or OkHttp for making HTTP requests
        // Here, we simply return a dummy response
        try {
            System.out.println("Request in thread..." + Thread.currentThread());
            HttpRequest request = HttpRequest.newBuilder()
                    .GET()
                    .uri(URI.create(url))
                    .setHeader("User-Agent", "Java 11 HttpClient Bot")
                    .build();
            HttpResponse<String> response = this.httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } 
        catch (Exception e) {
            return "";
        }
    }

    public static void main(String[] args) {

        long start = System.nanoTime();

        List<String> apiUrls = new ArrayList<>();
        IntStream.range(33001, 33401).forEach(i -> {
            apiUrls.add("https://api.zippopotam.us/us/" + i);
        });

        // Create a ForkJoinPool
        ForkJoinPool forkJoinPool = new ForkJoinPool(4);

        // Create a task for the API calls
        ApiCallTask task = new ApiCallTask(apiUrls);

        // Submit the task to the pool
        String result = forkJoinPool.invoke(task);

        // Print the result
        System.out.println("API Responses:");
        System.out.println(result);

        // Shutdown the pool
        forkJoinPool.shutdown();

        long end = System.nanoTime();
        long elapsedTime = end - start;
        double seconds = elapsedTime / 1_000_000_000.0;
        System.out.println("Time at: " + seconds);
    }
}
