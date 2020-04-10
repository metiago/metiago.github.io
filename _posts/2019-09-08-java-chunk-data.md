---
layout: default
title:  Java - Chunk Data
date:   2019-09-08 20:18:00 +0100
category: Dev
---

## Java - Chunk Data

This is an example of how to split an array in a predefined chunck of data. 

## Example

```java
package org.eclipse.che.examples;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

public class ArrayChunk {

    public static void main(final String... argvs) {

        final List<Integer> arr = Arrays.asList(1, 2, 3, 4, 5, 6);

        final int index = arr.size() / 2;

        List<int[]> result = get_chuncks(arr, index);

        for (int[] is : result) {
            
            for (int i = 0; i < is.length; i++) {
                System.out.println(is[i]);
            }
        }
    }

    private static List<int[]> get_chuncks(final List<Integer> list, int index) {

        final List<int[]> result = new ArrayList<>();

        int[] primitive = list.stream().filter(Objects::nonNull).mapToInt(Integer::intValue).toArray();

        for (int i = 0; i <= primitive.length; i++) {
            
            if(i > 0) {
                i = index;
                index = index * 2;
            }

            if(index > primitive.length) {
                break;
            }

            int[] slice = Arrays.copyOfRange(primitive, i, index);
            
            result.add(slice);
        }		

        return result;
    }
}

```