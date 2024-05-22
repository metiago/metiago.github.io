package org.example.loader;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Futures {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    static final  String URL = "https://centralizer-ms-onboarding-hti.apps.ocp-hml.getnet.com.br/centralizers/?legal_document_number=19818215692435";
    static final String TOKEN = "eyAiYWxnIjogIkhTMjU2IiwidHlwIjogIkpXVCIgfQ.ew0KCSJpc3MiOiJnZXRuZXQiLAkNCgkiZXhwaXJlc19pbiI6IjM2MDAiLA0KCSJhY2Nlc3NfdG9rZW4iOiJjOWQ5OGJkOC00ZjEwLTQ3OTMtOTQwYi1mMjAyMzI4NThhMjgiLAkNCgkiY2hhbm5lbCI6ImdldG5ldF9tZ20iLA0KCSJicmFuY2giOiIiLA0KCSJsb2dpbiI6InN2Y19ta3RwbGFjZSIsDQoJIm5hbWUiOiJNYXJrZXRwbGFjZSIsDQoJImVucm9sbG1lbnRfbnVtYmVyIjoiIiwNCgkicHVibGlzaGVyIjoiYXBpIg0KfQ.yNIusT3Jkuosl2PQMVwpDL-4EKABrqE0_nSd5bvIjro";

    private final HttpRequest request = HttpRequest.newBuilder()
            .GET()
            .uri(URI.create(URL))
            .setHeader("Authorization", TOKEN).build();

    public static void main(String[] args) throws Exception {
        Futures futures = new Futures();
        long start = System.nanoTime();
        ExecutorService e = Executors.newFixedThreadPool(8);
        List<CompletableFuture<Void>> queue = new ArrayList<>();
        for (int i = 0; i < 100_000; i++) {
        //while(true) {

            CompletableFuture<Void> cf = CompletableFuture.runAsync(() -> {
                try {
                    futures.call();
                } catch (Exception ex) {
                    throw new RuntimeException(ex);
                }
            }, e);
            queue.add(cf);

            //Thread.sleep(1000);
        }

        queue.forEach(CompletableFuture::join);

        long end = System.nanoTime();
        long elapsedTime = end - start;
        double seconds = elapsedTime / 1_000_000_000.0;
        System.out.println("Total time at: " + seconds);
    }

    private void call() throws Exception {
        System.out.println("Calling in... " + Thread.currentThread());
        long start = System.nanoTime();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        long end = System.nanoTime();
        long elapsedTime = end - start;
        double seconds = elapsedTime / 1_000_000_000.0;
        System.out.println("Request time at: " + seconds);
    }
}
