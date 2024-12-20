---
title: 'Merge Sort'
date: "2014-10-08"
draft: false
image: "https://images.unsplash.com/photo-1688841903048-c854db9b9b8e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
---

Sample merge sort algorithm.

```java

import java.util.Arrays;

/*
 * Java Program to sort an integer array using merge sort algorithm.
 */

public class MergeSort {

  public static void main(String[] args) {

    System.out.println("mergesort");
    int[] input = { 87, 57, 370, 110, 90, 610, 02, 710, 140, 203, 150 };

    System.out.println("array before sorting");
    System.out.println(Arrays.toString(input));

    // sorting array using MergeSort algorithm
    mergesort(input);

    System.out.println("array after sorting using mergesort algorithm");
    System.out.println(Arrays.toString(input));

  }

  /**
   * Java function to sort given array using merge sort algorithm
   * 
   * @param input
   */
  public static void mergesort(int[] input) {
    mergesort(input, 0, input.length - 1);
  }

  /**
   * A Java method to implement MergeSort algorithm using recursion
   * 
   * @param input
   *          , integer array to be sorted
   * @param start
   *          index of first element in array
   * @param end
   *          index of last element in array
   */
  private static void mergesort(int[] input, int start, int end) {

    // break problem into smaller structurally identical problems
    int mid = (start + end) / 2;
    if (start < end) {
      mergesort(input, start, mid);
      mergesort(input, mid + 1, end);
    }

    // merge solved pieces to get solution to original problem
    int i = 0, first = start, last = mid + 1;
    int[] tmp = new int[end - start + 1];

    while (first <= mid && last <= end) {
      tmp[i++] = input[first] < input[last] ? input[first++] : input[last++];
    }
    while (first <= mid) {
      tmp[i++] = input[first++];
    }
    while (last <= end) {
      tmp[i++] = input[last++];
    }
    i = 0;
    while (start <= end) {
      input[start++] = tmp[i++];
    }
  }
}
```
