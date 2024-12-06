---
title: 'Inter Thread Communication'
date: "2016-10-08"
draft: false
image: "https://placehold.co/600x400"
---

Inter-Thread Communication (ITC) refers to the mechanisms that allow threads within a process to
communicate and synchronize their actions. Since threads share the same memory space, they can
exchange data and signals directly, but this can lead to issues like race conditions if not managed
properly. Common ITC methods include:

1. **Mutexes**: Used to ensure that only one thread can access a resource at a time.
2. **Semaphores**: Used to control access to a common resource by multiple threads.
3. **Condition Variables**: Allow threads to wait for certain conditions to be met before
   proceeding.
4. **Message Queues**: Enable threads to send and receive messages in a structured way.

Effective ITC is crucial for building efficient and safe multithreaded applications.

```java
class SharedResource {

  private int data;
  private boolean available = false;

  public synchronized int getData() throws InterruptedException {
    while (!available) {
      wait(); // Wait until data is available
    }
    available = false; // Reset availability
    notify(); // Notify producer that data has been consumed
    return data;
  }

  public synchronized void setData(int data) throws InterruptedException {
    while (available) {
      wait(); // Wait until data is consumed
    }
    this.data = data;
    available = true; // Mark data as available
    notify(); // Notify consumer that data is available
  }
}

class Producer implements Runnable {

  private final SharedResource sharedResource;

  public Producer(SharedResource sharedResource) {
    this.sharedResource = sharedResource;
  }

  @Override
  public void run() {
    for (int i = 0; i < 3; i++) {
      try {
        System.out.println("Producing: " + i);
        sharedResource.setData(i); // Produce data
        Thread.sleep(500); // Simulate time taken to produce
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      }
    }
  }
}

class Consumer implements Runnable {

  private final SharedResource sharedResource;

  public Consumer(SharedResource sharedResource) {
    this.sharedResource = sharedResource;
  }

  @Override
  public void run() {
    for (int i = 0; i < 3; i++) {
      try {
        int data = sharedResource.getData(); // Consume data
        System.out.println("Consuming: " + data);
        Thread.sleep(1000); // Simulate time taken to consume
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      }
    }
  }
}

public class InterThreadCom {

  public static void main(String[] args) {

    SharedResource sharedResource = new SharedResource();

    Thread producerThread = new Thread(new Producer(sharedResource));
    Thread consumerThread = new Thread(new Consumer(sharedResource));

    producerThread.start();
    consumerThread.start();

    try {
      producerThread.join(); // Wait for the producer to finish
      consumerThread.join(); // Wait for the consumer to finish
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }
}
```

### CountDownLatch

```java
import java.util.concurrent.CountDownLatch;

class SharedResource {

  private int data;
  private boolean available = false;

  public synchronized int getData() throws InterruptedException {
    while (!available) {
      wait(); // Wait until data is available
    }
    available = false; // Reset availability
    notify(); // Notify producer that data has been consumed
    return data;
  }

  public synchronized void setData(int data) throws InterruptedException {
    while (available) {
      wait(); // Wait until data is consumed
    }
    this.data = data;
    available = true; // Mark data as available
    notify(); // Notify consumer that data is available
  }
}

class Producer implements Runnable {

  private final SharedResource sharedResource;
  private final CountDownLatch latch;

  public Producer(SharedResource sharedResource, CountDownLatch latch) {
    this.sharedResource = sharedResource;
    this.latch = latch;
  }

  @Override
  public void run() {
    for (int i = 0; i < 3; i++) {
      try {
        System.out.println("Producing: " + i);
        sharedResource.setData(i); // Produce data
        Thread.sleep(500); // Simulate time taken to produce
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      }
    }
    latch.countDown(); // Signal that the producer has finished
  }
}

class Consumer implements Runnable {

  private final SharedResource sharedResource;
  private final CountDownLatch latch;

  public Consumer(SharedResource sharedResource, CountDownLatch latch) {
    this.sharedResource = sharedResource;
    this.latch = latch;
  }

  @Override
  public void run() {
    for (int i = 0; i < 3; i++) {
      try {
        int data = sharedResource.getData(); // Consume data
        System.out.println("Consuming: " + data);
        Thread.sleep(1000); // Simulate time taken to consume
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      }
    }
    latch.countDown(); // Signal that the consumer has finished
  }
}

public class InterThreadCom {

  public static void main(String[] args) {
    SharedResource sharedResource = new SharedResource();
    CountDownLatch latch = new CountDownLatch(2); // Count down for producer and consumer

    Thread producerThread = new Thread(new Producer(sharedResource, latch));
    Thread consumerThread = new Thread(new Consumer(sharedResource, latch));

    producerThread.start();
    consumerThread.start();

    try {
      latch.await(); // Wait for both producer and consumer to finish
      System.out.println("Both producer and consumer have completed their tasks.");
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }
}
```

The first example you provided uses traditional synchronization mechanisms (i.e., `wait()`
and `notify()`) for inter-thread communication between a producer and a consumer. The modified
example incorporates `CountDownLatch` to manage synchronization and coordination between the
threads. Here are the benefits of using `CountDownLatch` over the traditional approach:

### Benefits of Using CountDownLatch

1. **Simplified Coordination**:
    - **CountDownLatch**: It provides a straightforward way to wait for multiple threads to complete
      their tasks. You can simply call `latch.await()` in the main thread, and it will block until
      the count reaches zero.
    - **Traditional Approach**: Using `wait()` and `notify()` requires more boilerplate code to
      manage the state of the threads and ensure that they are properly synchronized.

2. **Decoupling of Threads**:
    - **CountDownLatch**: The main thread does not need to know the details of how the producer and
      consumer operate. It only needs to wait for their completion, making the code cleaner and
      easier to understand.
    - **Traditional Approach**: The main thread may need to manage the state of the shared resource
      and ensure that the producer and consumer are properly synchronized, which can lead to more
      complex code.

3. **One-Time Use**:
    - **CountDownLatch**: It is designed for one-time use, which is ideal for scenarios where you
      want to wait for a specific number of events to occur. Once the count reaches zero, it cannot
      be reset, which is often the desired behavior in many applications.
    - **Traditional Approach**: The `wait()` and `notify()` methods can be reused, but managing the
      state of the shared resource can become cumbersome, especially if you need to reset the state.

4. **Clarity of Intent**:
    - **CountDownLatch**: The intent of waiting for a certain number of tasks to complete is clear
      and explicit. The use of `CountDownLatch` communicates the purpose of synchronization
      effectively.
    - **Traditional Approach**: The intent may be less clear, as it relies on the state of the
      shared resource and the use of `wait()` and `notify()`, which can be more difficult to follow.

5. **Error Handling**:
    - **CountDownLatch**: It provides a cleaner way to handle thread completion. If a thread
      encounters an error, you can handle it in the thread itself without affecting the main
      thread's waiting logic.
    - **Traditional Approach**: Error handling can be more complex, as you need to ensure that the
      state of the shared resource is consistent and that the waiting threads are notified
      appropriately.

6. **Flexibility**:
    - **CountDownLatch**: You can easily adjust the number of threads to wait for by changing the
      count in the `CountDownLatch` constructor. This makes it flexible for different scenarios.
    - **Traditional Approach**: Adjusting the number of threads and managing their states can
      require significant changes to the code.

### Summary

While both approaches can achieve inter-thread communication, using `CountDownLatch` simplifies the
code, improves clarity, and provides a more robust mechanism for coordinating the completion of
multiple threads. It reduces the complexity associated with traditional synchronization methods and
makes the intent of the code clearer. This can lead to fewer bugs and easier maintenance in
concurrent programming scenarios.