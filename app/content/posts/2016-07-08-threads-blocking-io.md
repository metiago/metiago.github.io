---
title: 'Thread Per Task - Thread Per Request'
date: "2015-07-08"
draft: false
image: "https://placehold.co/600x400"
---

In Java, the concepts of "Thread Per Task" and "Thread Per Request" refer to different threading
models used to handle concurrent tasks or requests in applications, particularly in server
environments. Here's a breakdown of each model:

### Thread Per Task

- **Definition**: In the Thread Per Task model, a new thread is created for each task that needs to
  be executed. This means that whenever a task is initiated, a dedicated thread is spawned to handle
  that task.

- **Advantages**:
    - **Simplicity**: The model is straightforward to implement, as each task runs in its own
      thread.
    - **Isolation**: Each task is isolated in its own thread, which can simplify debugging and error
      handling.

- **Disadvantages**:
    - **Resource Intensive**: Creating a new thread for every task can lead to high resource
      consumption, especially if tasks are short-lived or if there are many concurrent tasks.
    - **Overhead**: The overhead of thread creation and destruction can degrade performance,
      particularly under high load.
    - **Scalability Issues**: This model may not scale well with a large number of concurrent tasks,
      as the system can become overwhelmed with too many threads.

### Thread Per Request

- **Definition**: The Thread Per Request model is a specific application of the Thread Per Task
  model, commonly used in web servers. In this model, a new thread is created for each incoming
  request to the server.

- **Advantages**:
    - **Simplicity**: Like Thread Per Task, it is easy to understand and implement.
    - **Request Isolation**: Each request is handled in its own thread, which can help with managing
      state and errors.

- **Disadvantages**:
    - **Resource Consumption**: Similar to Thread Per Task, creating a thread for each request can
      lead to high memory and CPU usage.
    - **Thread Management**: The server may struggle to manage a large number of threads, leading to
      performance bottlenecks.
    - **Limited Scalability**: Under heavy load, the server may not be able to handle all incoming
      requests efficiently, leading to delays or dropped requests.

### Alternatives

Due to the limitations of both models, many modern applications use thread pools or asynchronous
processing models:

- **Thread Pool**: Instead of creating a new thread for each task/request, a fixed number of threads
  are maintained in a pool. Tasks are submitted to the pool, and available threads execute them.
  This reduces the overhead of thread creation and improves resource management.

- **Asynchronous Processing**: Using frameworks like CompletableFuture or reactive programming (
  e.g., using Project Reactor or RxJava) allows for non-blocking I/O operations, which can handle
  many requests concurrently without the need for a large number of threads.

### Cached Thread Pool

Each task creates a new thread, which can lead to high resource consumption, especially if many
tasks are initiated simultaneously. This can exhaust system resources (like memory and CPU), leading
to performance degradation or even application crashes.

```java

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


public class IoBoundApplication {

  private static final int NUMBER_OF_TASKS = 1000;

  public static void main(String[] args) {

    System.out.printf("Running %d tasks\n", NUMBER_OF_TASKS);

    long start = System.currentTimeMillis();
    performTasks();

    System.out.printf("Tasks took %dms to complete\n", System.currentTimeMillis() - start);
  }

  private static void performTasks() {

    try (ExecutorService executorService = Executors.newCachedThreadPool()) {

      for (int i = 0; i < NUMBER_OF_TASKS; i++) {
        executorService.submit(() -> blockingIoOperation());
      }
    }
  }

  private static void blockingIoOperation() {

    System.out.println("Executing a blocking task from thread: " + Thread.currentThread());
    try {
      Thread.sleep(1000);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }
}
```

### Fixed Thread Pool

A fixed thread pool limits the number of concurrent threads, which helps manage system resources
more effectively. Excess tasks are queued until a thread becomes available, preventing resource
exhaustion.

```java

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


public class Main {

  private static final int NUMBER_OF_TASKS = 10_000;

  public static void main(String[] args) {
    System.out.printf("Running %d tasks\n", NUMBER_OF_TASKS);

    long start = System.currentTimeMillis();
    performTasks();
    System.out.printf("Tasks took %dms to complete\n", System.currentTimeMillis() - start);
  }

  private static void performTasks() {
    try (ExecutorService executorService = Executors.newFixedThreadPool(1000)) {

      for (int i = 0; i < NUMBER_OF_TASKS; i++) {
        executorService.submit(() -> {
          for (int j = 0; j < 100; j++) {
            blockingIoOperation();
          }
        });
      }
    }
  }

  // Simulates a long blocking IO
  private static void blockingIoOperation() {
    System.out.println("Executing a blocking task from thread: " + Thread.currentThread());
    try {
      Thread.sleep(10);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }
}
```

