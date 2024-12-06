---
title: 'Java Threads - Synchronized'
date: "2016-12-08"
draft: false
image: "https://placehold.co/600x400"
---

In the provided Java code, the `synchronized` keyword is used on the `increment` and `decrement` methods of the `InventoryCounter` class. This ensures that these methods can only be accessed by one thread at a time, which is crucial in a multi-threaded environment where multiple threads may attempt to modify the same shared resource (in this case, the `items` variable).

### Key Points:

1. **Thread Safety**: By marking the `increment` and `decrement` methods as `synchronized`, the code prevents race conditions. This means that if one thread is executing `increment`, another thread cannot execute `decrement` (or vice versa) until the first thread has finished its execution of the synchronized method.

2. **Mutual Exclusion**: The `synchronized` keyword provides mutual exclusion, ensuring that only one thread can modify the `items` variable at any given time. This is essential for maintaining the integrity of the shared resource.

3. **Performance Consideration**: While synchronization helps in avoiding inconsistencies, it can also lead to performance bottlenecks if many threads are trying to access the synchronized methods simultaneously. This is because threads may be forced to wait for their turn to access the synchronized methods.

4. **Usage in Threads**: In the `main` method, two threads (`IncrementingThread` and `DecrementingThread`) are created and started. Each thread performs a loop of 10,000 increments or decrements on the `InventoryCounter`, demonstrating how synchronization manages concurrent access to the `items` variable.

Overall, the use of `synchronized` in this code is a fundamental approach to ensure that the inventory count remains accurate despite concurrent modifications from multiple threads.


```java

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
        private int items = 0;

        public synchronized void increment() {
            items++;
        }

        public synchronized void decrement() {
            items--;
        }

        public int getItems() {
            return items;
        }
    }
}
```

In this version of the Java code, synchronization is achieved using a custom lock object (`myLock`) instead of the `synchronized` keyword directly on the methods. This approach provides more flexibility and control over synchronization.

### Key Points:

1. **Custom Lock Object**: The `myLock` object is used as a monitor for synchronization. The `synchronized` block within the `increment` and `decrement` methods ensures that only one thread can execute the code inside the block at a time, effectively controlling access to the `items` variable.

2. **Thread Safety**: Similar to the previous example, this implementation ensures thread safety by preventing race conditions. When one thread is executing the `increment` or `decrement` method, other threads attempting to enter the synchronized block will be blocked until the first thread exits the block.

3. **Granular Control**: Using a custom lock object allows for more granular control over synchronization. For instance, you could synchronize on different objects for different parts of your code if needed, which can help in reducing contention and improving performance in more complex scenarios.

4. **Performance Consideration**: While this approach can be more flexible, it still carries the same potential performance implications as using the `synchronized` keyword. If many threads are trying to access the synchronized blocks simultaneously, they will still be forced to wait, which can lead to bottlenecks.

5. **Usage in Threads**: The `main` method creates and starts two threads (`IncrementingThread` and `DecrementingThread`), each performing a loop of 10,000 increments or decrements on the `InventoryCounter`. The synchronization ensures that the final count of `items` is accurate despite concurrent modifications.

Overall, this implementation demonstrates an alternative way to achieve thread safety in Java using synchronized blocks with a custom lock object, providing flexibility while maintaining the integrity of shared resources.

```java
public class Main {

    private final Object myLock = new Object();

    public static void main(String[] args) throws InterruptedException {
        new Main().run();
    }

    public void run() throws InterruptedException {
        InventoryCounter inventoryCounter = new InventoryCounter();
        IncrementingThread incrementingThread = new IncrementingThread(inventoryCounter);
        DecrementingThread decrementingThread = new DecrementingThread(inventoryCounter);

        incrementingThread.start();
        decrementingThread.start();

        incrementingThread.join();
        decrementingThread.join();

        System.out.println("We currently have " + inventoryCounter.getItems() + " items");
    }

    public class DecrementingThread extends Thread {

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

    public class IncrementingThread extends Thread {

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

    private class InventoryCounter {
        private int items = 0;

        public void increment() {
            synchronized (myLock) {
                items++;
            }
        }

        public void decrement() {
            synchronized (myLock) {
                items--;
            }
        }

        public int getItems() {
            return items;
        }
    }
}
```