---
layout: default
title:  Bubble Sort - Java
date:   2018-08-27 20:18:00 +0100
category: Dev
---

## Bubble Sort

Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in wrong order. This algorithm has a time complexity of O(n2)

```java

public class BubbleSort{

    static int[] data = new int[6];

    public static void main(String[] args) {
        data[0] = 5;
        data[1] = 3;
        data[2] = 6;
        data[3] = 4;
        data[4] = 2;
        data[5] = 1;
        
        bubbleSort(data);
        
        for (int i = 0; i < data.length; i++) {
            System.out.println(data[i]);
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