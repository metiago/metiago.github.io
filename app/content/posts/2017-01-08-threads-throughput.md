---
title: 'Throughput'
date: "2017-01-08"
draft: false
image: "https://placehold.co/600x400"
---

**Throughput** in the context of multithreading refers to the number of tasks or operations that a
multithreaded application can complete in a given period of time. It is a critical performance
metric that helps assess the efficiency and effectiveness of a multithreaded system.

Throughput in multithreading is a measure of how many tasks or operations a
multithreaded application can complete in a given time frame. It is influenced by factors such as
concurrency, resource utilization, context switching, and synchronization overhead. Optimizing
throughput in multithreaded applications is essential for achieving high performance and
responsiveness, especially in environments where multiple tasks need to be processed simultaneously.

#### Key Aspects of Throughput in Multithreading:

1. **Tasks per Second**:
    - Throughput can be measured in terms of the number of tasks or operations completed per second.
      A higher number indicates better performance and resource utilization.

2. **Concurrency**:
    - Multithreading allows multiple threads to run concurrently, which can significantly increase
      throughput by making better use of CPU resources. This is especially beneficial in CPU-bound
      applications where multiple threads can perform computations simultaneously.

3. **Resource Utilization**:
    - Effective multithreading can lead to improved resource utilization, as threads can share
      resources (like memory and I/O) and reduce idle time. This can enhance overall throughput.

4. **Context Switching**:
    - While multithreading can improve throughput, excessive context switching (the process of
      saving and loading the state of threads) can negatively impact performance. Each context
      switch incurs overhead, which can reduce the effective throughput.

5. **Synchronization Overhead**:
    - In multithreaded applications, threads often need to synchronize access to shared resources.
      This synchronization can introduce delays and reduce throughput if not managed properly.

6. **Scalability**:
    - Throughput in multithreaded applications can be affected by how well the application scales
      with the addition of more threads. Ideally, increasing the number of threads should lead to a
      proportional increase in throughput, but this is not always the case due to contention and
      resource limitations.

7. **Performance Bottlenecks**:
    - Identifying and addressing bottlenecks (such as locks, contention for shared resources, or I/O
      limitations) is crucial for maximizing throughput in multithreaded applications.


### Example

```java
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.math.BigInteger;
import java.net.InetSocketAddress;
import java.util.Random;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;


public class ThroughputHttpServer {

  private static final int PORT = 8000;
  private static final int NUMBER_OF_THREADS = 6;

  public static void main(String[] args) throws IOException {
    startServer();
  }

  public static void startServer() throws IOException {
    HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
    server.createContext("/search", new WordCountHandler());
    Executor executor = Executors.newFixedThreadPool(NUMBER_OF_THREADS);
    server.setExecutor(executor);
    System.out.println("Listen on port: " + PORT);
    server.start();
  }

  private static class WordCountHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange httpExchange) throws IOException {
      String query = httpExchange.getRequestURI().getQuery();
      String[] keyValue = query.split("=");
      String action = keyValue[0];
      String word = keyValue[1];
      System.out.println("Look up word: " + word);
      if (!action.equals("word")) {
        httpExchange.sendResponseHeaders(400, 0);
        return;
      }

      BigInteger veryBig = new BigInteger(new Random().nextInt(1000) * 4, new Random());
      BigInteger r = veryBig.nextProbablePrime();
      long count = r.longValue();

      byte[] response = Long.toString(count).getBytes();
      httpExchange.sendResponseHeaders(200, response.length);
      OutputStream outputStream = httpExchange.getResponseBody();
      outputStream.write(response);
      outputStream.close();
    }
  }

}
```

### Load Testing

docker run --rm jordi/ab -n 100 -c 10 http://myhostip:8000/search?word=war > output.txt

### General Statistics

1. **Concurrency Level**:
    - **Value**: `10`
    - **Meaning**: This indicates the number of multiple requests that were sent at the same time (
      concurrently) during the test.

2. **Time taken for tests**:
    - **Value**: `0.114 seconds`
    - **Meaning**: This is the total time taken to complete all the requests in the test.

3. **Complete requests**:
    - **Value**: `100`
    - **Meaning**: This shows the total number of requests that were successfully completed during
      the test.

4. **Failed requests**:
    - **Value**: `0`
    - **Meaning**: This indicates that there were no failed requests, which is a good sign of server
      stability.

5. **Total transferred**:
    - **Value**: `9800 bytes`
    - **Meaning**: This is the total amount of data transferred from the server to the client during
      the test, including headers and body.

6. **HTML transferred**:
    - **Value**: `400 bytes`
    - **Meaning**: This indicates the total amount of HTML content transferred during the test.

7. **Requests per second**:
    - **Value**: `876.65 [#/sec] (mean)`
    - **Meaning**: This metric shows the average number of requests that were processed by the
      server per second during the test.

8. **Time per request**:
    - **Value**: `11.407 [ms] (mean)`
    - **Meaning**: This is the average time taken to process each request.

9. **Time per request**:
    - **Value**: `1.141 [ms] (mean, across all concurrent requests)`
    - **Meaning**: This shows the average time taken per request when considering all concurrent
      requests. It is typically lower than the mean time per request because it averages the time
      across all concurrent connections.

10. **Transfer rate**:
    - **Value**: `83.90 [Kbytes/sec] received`
    - **Meaning**: This indicates the average rate at which data was received from the server during
      the test.

### Connection Times (ms)

This section provides a breakdown of the time taken for different phases of the connection:

- **Connect**:
    - **min**: `1 ms`, **mean**: `5 ms`, **median**: `4 ms`, **max**: `18 ms`
    - **Meaning**: This shows the time taken to establish a connection to the server. The values
      indicate the minimum, average, median, and maximum connection times.

- **Processing**:
    - **min**: `2 ms`, **mean**: `6 ms`, **median**: `5 ms`, **max**: `22 ms`
    - **Meaning**: This indicates the time taken by the server to process the request after the
      connection is established.

- **Waiting**:
    - **min**: `1 ms`, **mean**: `5 ms`, **median**: `5 ms`, **max**: `18 ms`
    - **Meaning**: This shows the time spent waiting for the server to respond after the request has
      been sent.

- **Total**:
    - **min**: `3 ms`, **mean**: `11 ms`, **median**: `9 ms`, **max**: `25 ms`
    - **Meaning**: This is the total time taken for the entire request, including connection,
      processing, and waiting times.

### Percentage of Requests Served Within a Certain Time (ms)

This section provides a percentile breakdown of the response times:

- **50% (median)**: `9 ms` - Half of the requests were served in 9 ms or less.
- **66%**: `11 ms` - Two-thirds of the requests were served in 11 ms or less.
- **75%**: `12 ms` - Three-quarters of the requests were served in 12 ms or less.
- **80%**: `13 ms` - 80% of the requests were served in 13 ms or less.
- **90%**: `18 ms` - 90% of the requests were served in 18 ms or less.
- **95%**: `21 ms` - 95% of the requests were served in 21 ms or less.
- **98%**: `25 ms` - 98% of the requests were served in 25 ms or less.
- **99%**: `25 ms` - 99% of the requests were served in 25 ms or less.
- **100% (longest request)**: `25 ms` - The longest request took 25 ms.

### Summary

Overall, the output indicates that your server handled the load well,
with no failed requests and a good average response time.
The detailed breakdown of connection times and percentiles provides insight into how the server
performs under load, which can help identify potential bottlenecks or areas for improvement.
If you have any further questions or need clarification on any specific part, feel free to ask!