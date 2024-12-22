---
title: 'Linear Searching - Minor Element'
date: "2014-08-08"
draft: false
excerpt: ""
image: "https://cdn.pixabay.com/photo/2017/09/04/16/00/feather-2714526_1280.jpg"
---

```java

public class MinorElement {

    public static void main(String[] args) {

        int a[] = {110, 244, 37, 49, 510};

        System.out.println(getMinor(a));
    }

    private static int getMinor(int items[]) {

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
