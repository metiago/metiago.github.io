---
title:  'Bubble Sort'
date: "2014-06-08"
draft: false
image: "https://images.unsplash.com/photo-1554566490-b43da2d4c8fe?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
---

Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in wrong order. This algorithm has a time complexity of O(n2)

```java
public class BubbleSort {

    public static void main(String[] args) {

        int[] items = {9, 3, 72, 101, 12, 65, 1, 6, 57, 5, 2};

        bubbleSort(items);

        for (int i = 0; i < items.length; i++) {
            System.out.println(items[i]);
        }
    }

    public static void bubbleSort(int[] array) {

        boolean isSorted = false;
        int lastUnsorted = array.length - 1;

        while(!isSorted) {

            isSorted = true;

            for(int i = 0; i <= lastUnsorted - 1; i++) {

                if(array[i] > array[i + 1]) {
                    swap(array, i, i + 1);
                    isSorted = false;
                }
            }

            lastUnsorted--;
        }
    }

    public static void swap(int[] array, int i, int j) {
        int tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
}
```

#### Example 2

```java

public class BubbleSort {

    public static void main(String[] args) {

        int[] items = {9, 3, 72, 101, 12, 65, 1, 6, 57, 5, 2};

        bubbleSort(items);

        for (int i = 0; i < items.length; i++) {
            System.out.println(items[i]);
        }
    }

    public static void bubbleSort(int[] array) {

        boolean isSorted = false;
        int lastUnsorted = array.length - 1;

        while(!isSorted) {

            isSorted = true;

            for(int i = 0; i <= lastUnsorted - 1; i++) {

                if(array[i] > array[i + 1]) {
                    swap(array, i, i + 1);
                    isSorted = false;
                }
            }

            lastUnsorted--;
        }
    }

    public static void swap(int[] array, int i, int j) {
        int tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
}


```
