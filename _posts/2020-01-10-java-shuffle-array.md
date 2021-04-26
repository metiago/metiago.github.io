---
layout: post
title:  Java - Shuffle Arrays
date:   2020-01-10 20:18:00 +0100
category: Dev
tags: algorithm datastructure design
---

#### Java Shuffle Arrays

These examples show how to shuffle arrays in Java using two different approaches.

#### Shuffle Array Elements using Collections Class

This method Arrays.asList() works with an array of objects only because autoboxing doesn’t work with generics.

```java

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ShuffleArray {

	public static void main(String[] args) {

		Integer[] intArray = { 1, 2, 3, 4, 5, 6, 7, 8, 9 };

		List<Integer> intList = Arrays.asList(intArray);

		Collections.shuffle(intList);

		intList.toArray(intArray);

		System.out.println(Arrays.toString(intArray));
	}
}

```

#### Shuffle Array using Random Class

This method can shuffle an array using a random index.

```java 
import java.util.Arrays;
import java.util.Random;

public class ShuffleArray {

	public static void main(String[] args) {
		
		int[] array = { 1, 2, 3, 4, 5, 6, 7 };
		
		Random rand = new Random();
		
		for (int i = 0; i < array.length; i++) {
			int randomIndexToSwap = rand.nextInt(array.length);
			int temp = array[randomIndexToSwap];
			array[randomIndexToSwap] = array[i];
			array[i] = temp;
		}
		System.out.println(Arrays.toString(array));
	}
}
```