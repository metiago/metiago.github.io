---
title: 'Insertion Sort'
date: "2015-05-08"
draft: false
image: "https://placehold.co/600x400"
---

Insertion sort is a simple sorting algorithm that works the way we sort playing cards in our hands with a time Complexity of O(n2) on Big O notation.


```java

import java.util.Arrays;

public class InsertionSort {

    public static void main(String[] args) {

        int[] items = {123, 3, 72, 101, 12, 65, 3, 24, 57, 93, 100};
        int[] result = insertionSort(items);
        Arrays.stream(result).forEach(System.out::println);
    }

    private static int[] insertionSort(int[] items) {

        int i; // index into unsorted section
        int j; // index into sorted section        

        for (i = 0; i < items.length; i++) {

            int current = items[i];

            for (j = i - 1; j > -1 && items[j] > current; j--) {
                items[j + 1] = items[j];
            }

            items[j + 1] = current;
        }

        return items;
    }
}
```
