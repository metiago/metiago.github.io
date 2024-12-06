---
title: 'Java Threads - DeadLocks'
date: "2016-09-08"
draft: false
image: "https://placehold.co/600x400"
---

The code is designed to demonstrate a potential deadlock situation, 
where both trains could end up waiting indefinitely for each other to release the locks on the roads.

The code has a potential deadlock situation:
If TrainA locks roadA and then tries to lock roadB, 
while at the same time TrainB locks roadB and tries to lock roadA, both trains will be waiting 
for each other to release the locks, resulting in a deadlock.

To avoid deadlock in this scenario, you can implement a strict locking order for acquiring the locks
on the roads. Specifically, both TrainA and TrainB should always attempt to lock roadA before roadB. 
This ensures that if one train holds the lock on roadA, the other train cannot lock roadB 
and vice versa, thus preventing circular waiting and eliminating the possibility of deadlock.
```java

import java.util.Random;


public class DeadLock {

    public static void main(String[] args) {

        Intersection intersection = new Intersection();
        Thread trainAThread = new Thread(new TrainA(intersection));
        Thread trainBThread = new Thread(new TrainB(intersection));

        trainAThread.start();
        trainBThread.start();
    }

    public static class TrainB implements Runnable {

        private Intersection intersection;

        private Random random = new Random();

        public TrainB(Intersection intersection) {
            this.intersection = intersection;
        }

        @Override
        public void run() {

            while (true) {
                long sleepingTime = random.nextInt(5);
                try {
                    Thread.sleep(sleepingTime);
                } catch (InterruptedException e) {
                }

                intersection.takeRoadB();
            }
        }
    }

    public static class TrainA implements Runnable {
        private Intersection intersection;
        private Random random = new Random();

        public TrainA(Intersection intersection) {
            this.intersection = intersection;
        }

        @Override
        public void run() {
            while (true) {
                long sleepingTime = random.nextInt(5);
                try {
                    Thread.sleep(sleepingTime);
                } catch (InterruptedException e) {
                }

                intersection.takeRoadA();
            }
        }
    }

    public static class Intersection {
        private Object roadA = new Object();
        private Object roadB = new Object();

        public void takeRoadA() {
            synchronized (roadA) {
                System.out.println("Road A is locked by thread " + Thread.currentThread().getName());

                synchronized (roadB) {
                    System.out.println("Train is passing through road A");
                    try {
                        Thread.sleep(1);
                    } catch (InterruptedException e) {
                    }
                }
            }
        }

        public void takeRoadB() {

            // Solution: Avoid circular lock and keep a strict order for lock
            // synchronized (roadA)
            // synchronized (roadB)
            synchronized (roadB) {
                System.out.println("Road B is locked by thread " + Thread.currentThread().getName());

                synchronized (roadA) {
                    System.out.println("Train is passing through road B");

                    try {
                        Thread.sleep(1);
                    } catch (InterruptedException e) {
                    }
                }
            }
        }
    }
}
```