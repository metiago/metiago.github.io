---
title: 'Java Virtual Threads'
date: "2024-01-08"
draft: false
image: "https://placehold.co/600x400"
---

Java Virtual Threads are a feature introduced in Project Loom, which aims to simplify concurrent
programming in Java by providing a lightweight implementation of threads. Unlike traditional Java
threads, which are mapped to operating system threads, virtual threads are managed by the Java
Virtual Machine (JVM) and are much lighter in terms of resource consumption.

### Key Features of Java Virtual Threads:

1. **Lightweight**: Virtual threads are much lighter than traditional threads, allowing you to
   create thousands or even millions of them without significant overhead.

2. **Simplified Concurrency**: They enable a more straightforward programming model for concurrent
   applications. You can write code that looks synchronous but runs asynchronously, making it easier
   to understand and maintain.

3. **Blocking Operations**: Virtual threads can block without consuming a platform thread. This
   means that when a virtual thread is waiting for I/O or other blocking operations, it does not tie
   up a system thread, allowing for better resource utilization.

4. **Structured Concurrency**: Project Loom introduces the concept of structured concurrency, which
   helps manage the lifecycle of threads and ensures that they are properly cleaned up when they are
   no longer needed.

5. **Integration with Existing APIs**: Virtual threads are designed to work seamlessly with existing
   Java APIs, including those that use traditional threads, making it easier to adopt them in
   existing applications.

### Examples

```java
import java.util.ArrayList;
import java.util.List;

public class Main {

  private static final int NUMBER_OF_VIRTUAL_THREADS = 1_000;

  public static void main(String[] args) throws InterruptedException {

    Runnable runnable = () -> System.out.println("Inside thread: " + Thread.currentThread());

    List<Thread> virtualThreads = new ArrayList<>();

    for (int i = 0; i < NUMBER_OF_VIRTUAL_THREADS; i++) {
      Thread virtualThread = Thread.ofVirtual().unstarted(runnable);
      virtualThreads.add(virtualThread);
    }

    long start = System.nanoTime();

    for (Thread virtualThread : virtualThreads) {
      virtualThread.start();
    }

    for (Thread virtualThread : virtualThreads) {
      virtualThread.join();
    }

    long end = System.nanoTime();
    long elapsedTime = end - start;
    double seconds = elapsedTime / 1_000_000_000.0;
    System.out.println("Time at: " + seconds);
  }
}
```

```java

import java.util.ArrayList;
import java.util.List;

public class Main {

  private static final int NUMBER_OF_VIRTUAL_THREADS = 1_000;

  public static void main(String[] args) throws InterruptedException {
    List<Thread> virtualThreads = new ArrayList<>();

    for (int i = 0; i < NUMBER_OF_VIRTUAL_THREADS; i++) {
      Thread virtualThread = Thread.ofVirtual().unstarted(new BlockingTask());
      virtualThreads.add(virtualThread);
    }

    long start = System.nanoTime();

    for (Thread virtualThread : virtualThreads) {
      virtualThread.start();
    }

    for (Thread virtualThread : virtualThreads) {
      virtualThread.join();
    }

    long end = System.nanoTime();
    long elapsedTime = end - start;
    double seconds = elapsedTime / 1_000_000_000.0;
    System.out.println("Time at: " + seconds);
  }

  private static class BlockingTask implements Runnable {

    @Override
    public void run() {
      System.out.println("Inside thread: " + Thread.currentThread() + " before blocking call");
      try {
        Thread.sleep(1000);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }
      System.out.println("Inside thread: " + Thread.currentThread() + " after blocking call");
    }
  }
}
```

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
    try (ExecutorService executorService = Executors.newVirtualThreadPerTaskExecutor()) {

      for (int i = 0; i < NUMBER_OF_TASKS; i++) {
        executorService.submit(new Runnable() {
          @Override
          public void run() {
            for (int j = 0; j < 100; j++) {
              blockingIoOperation();
            }
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