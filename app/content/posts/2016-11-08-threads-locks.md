---
title: 'ReentrantLock & ReentrantReadWriteLock'
date: "2016-11-08"
draft: false
image: "https://placehold.co/600x400"
---

`ReentrantLock` and `ReentrantReadWriteLock` are both synchronization mechanisms in Java that are part of the `java.util.concurrent.locks` package. However, they serve different purposes and have different characteristics. Here are the key differences between the two:

### 1. Locking Mechanism

- **ReentrantLock**:
    - It is a mutual exclusion lock that allows only one thread to hold the lock at any given time.
    - If a thread holds the lock, other threads trying to acquire the same lock will be blocked until the lock is released.

- **ReentrantReadWriteLock**:
    - It allows multiple threads to read the shared resource concurrently, but only one thread can write to the resource at a time.
    - It has two types of locks: a read lock and a write lock.
        - **Read Lock**: Multiple threads can acquire the read lock simultaneously as long as no thread holds the write lock.
        - **Write Lock**: Only one thread can hold the write lock, and no other thread can hold either the read or write lock while the write lock is held.

### 2. Performance

- **ReentrantLock**:
    - It is suitable for scenarios where there are frequent write operations or when the critical section is short.
    - It can lead to contention if many threads are trying to acquire the lock simultaneously.

- **ReentrantReadWriteLock**:
    - It is more efficient in scenarios where there are many read operations and fewer write operations.
    - It allows for better concurrency by enabling multiple threads to read simultaneously, which can improve performance in read-heavy applications.

### 3. Use Cases

- **ReentrantLock**:
    - Use it when you need a simple mutual exclusion lock and when the critical section is not heavily read-oriented.
    - Suitable for scenarios where you need to manage a single shared resource with exclusive access.

- **ReentrantReadWriteLock**:
    - Use it when you have a shared resource that is read frequently but written infrequently.
    - Ideal for scenarios like caching, where multiple threads can read the cache simultaneously, but updates to the cache need to be exclusive.

### 4. API Differences

- **ReentrantLock**:
    - Provides methods like `lock()`, `unlock()`, `tryLock()`, and `newCondition()` for managing the lock and associated conditions.

- **ReentrantReadWriteLock**:
    - Provides separate methods for acquiring read and write locks: `readLock()` and `writeLock()`, each with their own `lock()`, `unlock()`, and `tryLock()` methods.

### Summary

In summary, use `ReentrantLock` for simple mutual exclusion scenarios, and use `ReentrantReadWriteLock` when you need to optimize for scenarios with many reads and fewer writes. The choice between the two depends on the specific requirements of your application and the expected read/write patterns.

### ReentrantLock Example

```java
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

class Counter {

    private int count = 0;

    private final ReentrantLock lock = new ReentrantLock();

    public void increment() {
        lock.lock();
        try {
            count++;
        }
        finally {
            lock.unlock();
        }
    }

    public int getCount() {
        return count;
    }
}

public class Main {

    public static void main(String[] args) {

        Counter counter = new Counter();
        List<Thread> threads = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            threads.add(new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    counter.increment();
                }
            }));
        }

        threads.forEach(Thread::start);

        threads.forEach(t -> {
          try {
            t.join();
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        });

        System.out.println("Final count: " + counter.getCount());
    }
}

```

### ReentrantReadWriteLock Example

```java 
import java.util.concurrent.locks.ReentrantReadWriteLock;

class SharedResource {

    private int data;

    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    // Method to read the data
    public int read() {
        lock.readLock().lock(); // Acquire the read lock
        try {
            return data;
        } finally {
            lock.readLock().unlock(); // Ensure the read lock is released
        }
    }

    // Method to write data
    public void write(int value) {
        lock.writeLock().lock(); // Acquire the write lock
        try {
            data = value;
        } finally {
            lock.writeLock().unlock(); // Ensure the write lock is released
        }
    }
}

public class Main {

    public static void main(String[] args) {

        SharedResource sharedResource = new SharedResource();

        // Create and start reader threads
        for (int i = 0; i < 5; i++) {
            new Thread(() -> {
                for (int j = 0; j < 5; j++) {
                    int value = sharedResource.read();
                    System.out.println("Read value: " + value);
                    try {
                        Thread.sleep(100); // Simulate some delay
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }).start();
        }

        // Create and start writer threads
        for (int i = 0; i < 2; i++) {
            final int writerId = i;
            new Thread(() -> {
                for (int j = 0; j < 5; j++) {
                    sharedResource.write(writerId * 10 + j);
                    System.out.println("Written value: " + (writerId * 10 + j));
                    try {
                        Thread.sleep(200); // Simulate some delay
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }).start();
        }
    }
}
```