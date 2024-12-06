---
title: 'Data Race and Race Condition'
date: "2016-08-08"
draft: false
image: "https://placehold.co/600x400"
---

### Data Race
A data race occurs when two or more threads (or processes) access the same piece of data at the same time, and at least one of those accesses involves modifying the data. Because the threads are running concurrently, the final value of the data can be unpredictable and may depend on the timing of the threads. This can lead to inconsistent or incorrect results.

### Race Condition
A race condition is a broader concept that refers to a situation where the outcome of a program depends on the sequence or timing of uncontrollable events, such as the order in which threads are scheduled to run. This can happen even if there are no direct conflicts over shared data. Essentially, if the timing of events affects the program's behavior or results, a race condition exists.

### Key Differences
- **Scope**: A data race specifically involves concurrent access to shared data, while a race condition can involve any situation where the timing of events affects the program's correctness.
- **Outcome**: Data races lead to unpredictable results due to simultaneous access to data, whereas race conditions can lead to unexpected behavior based on the order of operations, which may or may not involve shared data.


```java

public class DataRace {

    public static void main(String[] args) {
        SharedClass sharedClass = new SharedClass();
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < Integer.MAX_VALUE; i++) {
                sharedClass.increment();
            }
        });

        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < Integer.MAX_VALUE; i++) {
                sharedClass.checkForDataRace();
            }

        });

        thread1.start();
        thread2.start();
    }

    public static class SharedClass {
        private int x = 0;
        private int y = 0;

        public void increment() {
            x++;
            y++;
        }

        public void checkForDataRace() {
            if (y > x) {
                System.out.println("y > x - Data Race is detected");
            }
        }
    }
}
```