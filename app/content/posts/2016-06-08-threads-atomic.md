---
title: 'Java Threads - Atomic'
date: "2016-06-08"
draft: false
image: "https://placehold.co/600x400"
---


`AtomicInteger` and `AtomicReference` are part of the `java.util.concurrent.atomic` package in Java,
which provides classes that support lock-free thread-safe programming on single variables. These
classes are useful in concurrent programming where multiple threads need to read and update shared
variables without using traditional synchronization mechanisms like `synchronized` blocks
or `ReentrantLock`.

### Atomic Integer

`AtomicInteger` is a class that provides an integer value that may be updated atomically. It
supports various atomic operations, such as incrementing, decrementing, and setting the value. Here
are some key features and methods of `AtomicInteger`:

- **Constructor**: You can create an `AtomicInteger` with an initial value.
  ```java
  AtomicInteger atomicInt = new AtomicInteger(0);
  ```

- **Methods**:
    - `get()`: Returns the current value.
    - `set(int newValue)`: Sets to the given value.
    - `getAndSet(int newValue)`: Sets to the given value and returns the old value.
    - `incrementAndGet()`: Increments by one and returns the updated value.
    - `decrementAndGet()`: Decrements by one and returns the updated value.
    - `compareAndSet(int expect, int update)`: Atomically sets the value to the given updated value
      if the current value equals the expected value.

### Example of Atomic Integer

```java
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicIntegerExample {

  public static void main(String[] args) {
    AtomicInteger atomicInt = new AtomicInteger(0);

    // Increment the value
    int incrementedValue = atomicInt.incrementAndGet();
    System.out.println("Incremented Value: " + incrementedValue); // Output: 1

    // Compare and set
    boolean wasUpdated = atomicInt.compareAndSet(1, 2);
    System.out.println("Was Updated: " + wasUpdated); // Output: true
    System.out.println("Current Value: " + atomicInt.get()); // Output: 2
  }
}
```

### Atomic Reference

`AtomicReference` is a class that provides an object reference that may be updated atomically. It is
useful for managing references to objects in a thread-safe manner. Here are some key features and
methods of `AtomicReference`:

- **Constructor**: You can create an `AtomicReference` with an initial reference.
  ```java
  AtomicReference<MyObject> atomicRef = new AtomicReference<>(new MyObject());
  ```

- **Methods**:
    - `get()`: Returns the current reference.
    - `set(MyObject newValue)`: Sets to the given reference.
    - `getAndSet(MyObject newValue)`: Sets to the given reference and returns the old reference.
    - `compareAndSet(MyObject expect, MyObject update)`: Atomically sets the reference to the given
      updated reference if the current reference is equal to the expected reference.

### Example of AtomicInteger

```java
import java.util.concurrent.atomic.AtomicInteger;

public class Main {

  public static void main(String[] args) throws InterruptedException {

    InventoryCounter inventoryCounter = new InventoryCounter();

    IncrementingThread incrementingThread = new IncrementingThread(inventoryCounter);

    DecrementingThread decrementingThread = new DecrementingThread(inventoryCounter);

    incrementingThread.start();
    decrementingThread.start();

    incrementingThread.join();
    decrementingThread.join();

    System.out.println("We currently have " + inventoryCounter.getItems() + " items");
  }

  public static class DecrementingThread extends Thread {

    private final InventoryCounter inventoryCounter;

    public DecrementingThread(InventoryCounter inventoryCounter) {
      this.inventoryCounter = inventoryCounter;
    }

    @Override
    public void run() {
      for (int i = 0; i < 10000; i++) {
        inventoryCounter.decrement();
      }
    }
  }

  public static class IncrementingThread extends Thread {

    private final InventoryCounter inventoryCounter;

    public IncrementingThread(InventoryCounter inventoryCounter) {
      this.inventoryCounter = inventoryCounter;
    }

    @Override
    public void run() {
      for (int i = 0; i < 10000; i++) {
        inventoryCounter.increment();
      }
    }
  }

  private static class InventoryCounter {

    private final AtomicInteger items = new AtomicInteger(0);

    public void increment() {
      items.incrementAndGet();
    }

    public void decrement() {
      items.decrementAndGet();
    }

    public int getItems() {
      return items.get();
    }
  }
}
```

### Example of AtomicInteger

```java 
import java.util.concurrent.atomic.AtomicReference;

public class Main {

    public static void main(String[] args) throws InterruptedException {

        InventoryCounter inventoryCounter = new InventoryCounter();

        IncrementingThread incrementingThread = new IncrementingThread(inventoryCounter);
        DecrementingThread decrementingThread = new DecrementingThread(inventoryCounter);

        incrementingThread.start();
        decrementingThread.start();

        incrementingThread.join();
        decrementingThread.join();

        System.out.println("We currently have " + inventoryCounter.getItems() + " items");
    }

    public static class DecrementingThread extends Thread {

        private final InventoryCounter inventoryCounter;

        public DecrementingThread(InventoryCounter inventoryCounter) {
            this.inventoryCounter = inventoryCounter;
        }

        @Override
        public void run() {
            for (int i = 0; i < 10000; i++) {
                inventoryCounter.decrement();
            }
        }
    }

    public static class IncrementingThread extends Thread {

        private final InventoryCounter inventoryCounter;

        public IncrementingThread(InventoryCounter inventoryCounter) {
            this.inventoryCounter = inventoryCounter;
        }

        @Override
        public void run() {
            for (int i = 0; i < 10000; i++) {
                inventoryCounter.increment();
            }
        }
    }

    private static class InventoryCounter {

        // Using AtomicReference to hold the current count as an Integer object
        private final AtomicReference<Integer> items = new AtomicReference<>(0);

        public void increment() {
            // Atomically update the reference to the new count
            while (true) {
                Integer current = items.get();
                Integer newValue = current + 1;
                if (items.compareAndSet(current, newValue)) {
                    break; // Successfully updated
                }
            }
        }

        public void decrement() {
            // Atomically update the reference to the new count
            while (true) {
                Integer current = items.get();
                Integer newValue = current - 1;
                if (items.compareAndSet(current, newValue)) {
                    break; // Successfully updated
                }
            }
        }

        public int getItems() {
            return items.get();
        }
    }
}
```

### Summary

- `AtomicInteger` is used for atomic operations on integers.
- `AtomicReference` is used for atomic operations on object references.
- Both classes provide methods that allow for safe concurrent updates without the need for explicit
  locking, making them suitable for high-performance applications.