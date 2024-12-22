---
title: 'Binary Search'
date: "2014-05-08"
draft: false
excerpt: ""
image: "https://plus.unsplash.com/premium_photo-1674677788210-ea8be01cd424?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
---

Binary search, is a search algorithm that finds the position of a target value within a sorted array. Binary search has a time complexity of O(log n) in Big O notation.

### Binary Search Example 1

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
