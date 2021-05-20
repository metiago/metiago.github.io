---
layout: post
title:  Java Date Api - Duration
date:   2018-10-23 20:18:00 +0100
category: Dev
tags: algorithm java
---

Below there are some examples using Java's date API - Duration.


```java

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.temporal.ChronoUnit;

public class Main {

    public static void main(String[] args) {

        Duration oneHours = Duration.ofHours(1); // 3600 seconds

        Duration oneHours2 = Duration.of(1, ChronoUnit.HOURS); // 3600 seconds

        System.out.println(oneHours2.getSeconds() + " seconds");

        LocalDateTime oldDate = LocalDateTime.of(2016, Month.AUGUST, 31, 10, 20, 55); // 2016-08-31T10:20:55
        LocalDateTime newDate = LocalDateTime.of(2016, Month.NOVEMBER, 9, 10, 21, 56); // 2016-11-09T10:21:56

        Duration duration = Duration.between(oldDate, newDate); // 6048061 seconds
    }
}
```