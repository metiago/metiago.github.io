---
layout: post
title:  Binary Searching in Java
date:   2018-07-16 20:18:00 +0100
category: Dev
tags: algorithm datastructure
---

Binary search, is a search algorithm that finds the position of a target value within a sorted array. Binary search has a time complexity of O(log n) in Big O notation.

```java

public class BinarySearch {

    public static void main(String[] args) {

        int[] items = {11, 24, 37, 49, 510};

        System.out.println(binarySearch(items, 24));
    }

    private static int binarySearch(int items[], int elem) {

        int lowIndex = 0;
        int highIndex = items.length;

        for (int i = 0; i < items.length; i++) {
            int middleIndex = (int) Math.floor((lowIndex + highIndex) / 2);
            if (items[middleIndex] == elem) {
                return middleIndex;
            } else if (elem > items[middleIndex]) {
                lowIndex = middleIndex;
            } else {
                highIndex = middleIndex;
            }
        }

        return -1;
    }
}
```