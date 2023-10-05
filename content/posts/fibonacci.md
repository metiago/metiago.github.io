+++
title = 'Fibonacci'
date = 1500-01-02T19:18:41-03:00
+++

Java fibonacci no recursion

```java
public void execute() {
    int a = 0;
    int b = 1;
    int c = 0;
    for (int i=0; i < 10; i++) { 
        c = a + b;          
        System.out.print(c + " ");
        a = b;
        b = c;
    }
}
```