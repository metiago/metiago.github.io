---
title:  'Linear Searching'
date: "2014-09-08"
draft: false
image: "https://placehold.co/600x400"
---


Linear search method for finding an element within a list. It sequentially checks each element of the list until a match is found or the whole list has been searched. Linear search has a time complexity of O(n)

```java

public class LinearSearch {

    public static void main(String[] args) {

        int a[] = {11, 24, 37, 49, 510};

        System.out.println(hasElement(a, 11));
    }

    private static boolean hasElement(int items[], int elem) {

        for (int i = 0; i < items.length; i++) {

            if (items[i] == elem) {
                return true;
            }
        }

        return false;
    }
}


```
