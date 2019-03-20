---
layout: default
title:  Java Date Api - Period
date:   2018-10-09 20:18:00 +0100
category: Dev
---

## String to Date Java - JDK 8+

Below there are some examples using Java's date API - Period.


```java

import java.time.LocalDate;
import java.time.Month;
import java.time.Period;

public class Main {

    public static void main(String[] args) {

        Period tenDays = Period.ofDays(10); // 10
        
        Period oneYearTwoMonthsThreeDays = Period.of(1, 2, 3);
        System.out.println(oneYearTwoMonthsThreeDays.getYears());   // 1
        System.out.println(oneYearTwoMonthsThreeDays.getMonths());  // 2
        System.out.println(oneYearTwoMonthsThreeDays.getDays());    // 3

        LocalDate oldDate = LocalDate.of(1982, Month.AUGUST, 31); // 1982-08-31
        LocalDate newDate = LocalDate.of(2016, Month.NOVEMBER, 9); // 2016-11-09

        Period period = Period.between(oldDate, newDate); // 34 years,2 months,9 days
    }
}
```