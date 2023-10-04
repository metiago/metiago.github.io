+++

title =  'Linear Searching - Minor Element'
date = 1500-04-23T19:18:41-03:00


+++

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
