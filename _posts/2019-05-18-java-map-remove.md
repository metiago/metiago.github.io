---
layout: post
title:  Java - Remove Map Element
date:   2019-07-09 20:18:00 +0100
category: Dev
tags: algorithm datastructure
---

## Java - Remove Map Element 

Snipet of how to remove an element from a Map data structure.

```java
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

public class Example {

    public static void main(String[] args) {

        Map<Integer, String> data = new HashMap<>();
        data.put(1, "Home");
        data.put(2, "Flower");
        data.put(3, "Dog");
        data.put(4, "Family");

        Iterator<Entry<Integer, String>> iter = data.entrySet().iterator();

       while (iter.hasNext()) {

           Entry<Integer, String> entry = iter.next();

           if(entry.getValue().equals("Home")) {
               iter.remove();
           }
       }

       data.forEach((k,v) -> System.out.println(v));
    }

}
```