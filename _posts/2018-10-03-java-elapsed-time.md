---
layout: default
title:  Elapsed Time in Java
date:   2018-10-03 20:18:00 +0100
category: Dev
---

## Elapsed Time in Java - JDK 8+

Below there is a simple example of how to get the time spent by a certain algorithm.


```java

package com.tiago.dates;

import java.time.Duration;
import java.time.Instant;

public class Main {

	public static void main(String[] args) {
		
		Instant start = Instant.now();
		
		longTask();
		
		Instant end = Instant.now();
		Duration timeElapsed = Duration.between(start, end);
		long millis = timeElapsed.toMillis();
		
		System.out.println(String.format("Elapsed Time %s", millis));
	}
}
```