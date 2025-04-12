---
title: 'Elapsed Time'
date: "2014-07-03"
draft: false
---

```java
long start = System.nanoTime();

// long running task

long end = System.nanoTime();
long elapsedTime = end - start;
double seconds = elapsedTime / 1_000_000_000.0;
System.out.println("Time at: " + seconds);
```