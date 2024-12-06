---
title: 'Quick Sort'
date: "2015-01-08"
draft: false
image: "https://placehold.co/600x400"
---

QuickSort is a divide and conquer algorithm. It picks an element as pivot and partitions the given array around the picked pivot. There are many different versions of quickSort that pick pivot in different ways. This algorithm has a time complexy of O(nlog2(n)) on average and O(n2) for worst case.


```java

import java.util.Arrays;

public class QuickSort {

    public static void main(String[] args) {

        int[] items = {6, 1, 23, 4, 2, 3};
        int[] result = quickSort(items, 0, items.length - 1);
        Arrays.stream(result).forEach(System.out::println);
    }

    private static int[] quickSort(int[] items, int left, int right) {

        int index = 0;

        if (items.length > 1) {

            index = partition(items, left, right);

            if (left < index - 1) {
                quickSort(items, left, index - 1);
            }
        }

        if (index < right) {
            quickSort(items, index, right);
        }

        return items;
    }

    private static int partition(int[] items, int left, int right) {

        int pivot = items[(int) Math.floor((right + left) / 2)];

        while (left <= right) {

            while (pivot > items[left]) {
                left++;
            }

            while (pivot < items[right]) {
                right--;
            }

            if (left <= right) {
                int tmp = items[left];
                items[left] = items[right];
                items[right] = tmp;
                left++;
                right--;
            }
        }

        return left;
    }
}
```
