---
layout: post
title:  Linear Searching in Java - Minor Element
date:   2019-12-06 20:18:00 +0100
category: Dev
tags: algorithm datastructure design
---

## Linear Search

Linear search a method for finding an element within a list. It sequentially checks each element of the list until a match is found or the whole list has been searched. Linear search has a time complexity of O(n).

This example shows how to find the minor element inside an array.

```java

public class MinorElement {

    public static void main(String[] args) {

        int a[] = {110, 244, 37, 49, 510};

        System.out.println(hasElement(a));
    }

    private static int hasElement(int items[]) {

        int minor = 0;

        for (int i = 0; i < items.length; i++) {

            if (items[i] < items[minor]) {
                minor = i;
            }
        }

        return items[minor];
    }
}

```
