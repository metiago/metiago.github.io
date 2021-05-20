---
layout: post
title:  Java - Chunk Data
date:   2019-09-08 20:18:00 +0100
category: Dev
tags: algorithm datastructure java
---



This is an example of how to split an array in a predefined chunck of data. 

## Example

```java
package org.eclipse.che.examples;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

public class ArrayChunk {

    private static final int NUM_OF_CHUNKS = 4;

    private static final List<Integer> arr = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 20, 30, 40, 50, 60, 70, 80);

    public static void main(final String... argvs) {

        final List<List<Integer>> result = new ArrayList<>();

        final AtomicInteger counter = new AtomicInteger();

        for (final int number : arr) {

            if (counter.getAndIncrement() % NUM_OF_CHUNKS == 0) {
                result.add(new ArrayList<>());
            }
            result.get(result.size() - 1).add(number);
        }

        System.out.println(result);
    }
    
}

```