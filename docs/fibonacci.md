# Fibonacci

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