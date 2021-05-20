---
layout: post
title:  Selection Sort in Java
date:   2018-09-21 20:18:00 +0100
category: Dev
tags: algorithm datastructure
---

The selection sort algorithm sorts an array by repeatedly finding the minimum element (considering ascending order) from unsorted part and putting it at the beginning. The algorithm maintains two subarrays in a given array.


```java

public class SelectionSort {

    public static void main(String[] args) {

        int [] a = {99, 1, 77, 12, 55, 88, 23, 11, 7, 3, 2};
        int [] result = selectionSort(a);
        Arrays.stream(result).forEach(System.out::println);
    }

    private static int[] selectionSort(int items[]) {

        for (int i = 0; i < items.length; i++) {

            int min = i;

            for (int j = i + 1; j < items.length; j++) {

                if (items[j] < items[min]) {
                    min = j;
                }
            }

            if (i != min) {
                int swap = items[i];
                items[i] = items[min];
                items[min] = swap;
            }
        }

        return items;
    }
}

```