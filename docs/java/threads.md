---
title: 'Java Threads'
date: 2023-04-02T19:18:41-03:00
draft: false
---

The provided Java code defines a `FirstThread` class that demonstrates multithreading by creating two separate threads: `AscendingItemThread` and `DescendingItemThread`. 

- The `AscendingItemThread` sorts the characters of each item in a predefined list (`items`) in ascending order and prints them, pausing for one second between each item.
- The `DescendingItemThread` simply prints each item from the same list in its original order, also with a one-second pause between prints.

Both threads are started in the `main` method, allowing them to run concurrently. The code showcases basic thread management and string manipulation in Java.


```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FirstThread {

    final static List<String> items = List.of(
            "Book", "Pen", "Notebook", "Laptop", "Backpack",
            "Eraser", "Pencil", "Folder", "Calculator", "Highlighter",
            "Stapler", "Tape", "Glue", "Ruler", "Marker",
            "Sketchbook", "Whiteboard", "Chalk", "Scissors", "Paper Clips", "Storage Box");

    public static void main(String[] args) throws InterruptedException {

        List<Thread> threads = new ArrayList<>();

        threads.add(new AscendingItemThread());
        threads.add(new DescendingItemThread());

        for (Thread thread : threads) {
            // thread.setDaemon(true);
            thread.start();
        }
    }

    private static class AscendingItemThread extends Thread {

        @Override
        public void run() {

            try {

                for (String item : items) {
                    char[] characters = item.toCharArray();
                    Arrays.sort(characters);
                    System.out.println(new String(characters));
                    Thread.sleep(1000);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    private static class DescendingItemThread extends Thread {

        @Override
        public void run() {

            try {
            
                for (String item : items) {
                    System.out.println(item);
                    Thread.sleep(1000);
                }
            } 
            catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```

## Volatile

The provided Java code demonstrates a multi-threaded application that calculates and prints 
the average of time samples collected by two BusinessLogic threads. 

The code highlights the use of volatile for the average variable and the non-atomic nature of 
operations involving double and long types. Let's break down the key 
components and emphasize the relevant points.


```java

import java.util.Random;

public class Volatile {

    public static void main(String[] args) {

        Metrics metrics = new Metrics();

        BusinessLogic businessLogicThread1 = new BusinessLogic(metrics);

        BusinessLogic businessLogicThread2 = new BusinessLogic(metrics);

        MetricsPrinter metricsPrinter = new MetricsPrinter(metrics);

        businessLogicThread1.start();
        businessLogicThread2.start();
        metricsPrinter.start();
    }

    public static class MetricsPrinter extends Thread {
        private Metrics metrics;

        public MetricsPrinter(Metrics metrics) {
            this.metrics = metrics;
        }

        @Override
        public void run() {
            while (true) {
                try {
                    Thread.sleep(1);
                } catch (InterruptedException e) {
                }

                double currentAverage = metrics.getAverage();

                System.out.println("Current Average is " + currentAverage);
            }
        }
    }

    public static class BusinessLogic extends Thread {
        private Metrics metrics;
        private Random random = new Random();

        public BusinessLogic(Metrics metrics) {
            this.metrics = metrics;
        }

        @Override
        public void run() {
            while (true) {
                long start = System.currentTimeMillis();

                try {
                    Thread.sleep(random.nextInt(2));
                } catch (InterruptedException e) {
                }

                long end = System.currentTimeMillis();

                metrics.addSample(end - start);
            }
        }
    }

    public static class Metrics {
        private long count = 0;
        private volatile double average = 0.0;

        public synchronized void addSample(long sample) {
            double currentSum = average * count;
            count++;
            average = (currentSum + sample) / count;
        }

        public double getAverage() {
            return average;
        }
    }
}
```