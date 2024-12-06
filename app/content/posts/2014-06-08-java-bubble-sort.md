---
title:  'Bubble Sort'
date: "2014-06-08"
draft: false
image: "https://placehold.co/600x400"
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
