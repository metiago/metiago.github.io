---
layout: post
title:  String to Date in Java
date:   2018-10-09 20:18:00 +0100
category: Dev
tags: algorithm java 
---

Below there is a simple example to convert a given string.


```java

package com.tiago.dates;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Main {

	public static void main(String[] args) {
		
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

		String date = "16/08/2016";
		
		LocalDate localDate = LocalDate.parse(date, formatter);
		
		System.out.println(localDate); // ISO FORMAT
        System.out.println(formatter.format(localDate)); // FORMATTED
	}
}
```