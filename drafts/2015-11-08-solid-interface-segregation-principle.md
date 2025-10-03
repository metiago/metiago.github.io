---
title: 'Interface Segregation Principle'
date: "2015-11-08"
draft: false

---

The principle defines that clients should not be forced to implement methods that won't be used by them.

`Stack.java`

### Example

```java
public interface Stack {

    void push (int data);

    void pop (int data);

    void peek();
}
```

`StackGenerator.java`

```java
public class StackGenerator implements Stack {

    @Override
    public void push(int data) {

    }

    @Override
    public void pop(int data) {

    }

    @Override
    public void peek() {
        
    }
}
```

You can see that once we implements the `Stack interface`, `StackGenerator` must implement all methods defined in the interface. Although we don't need
`peek()` method, we're enforced to implement it.

Based on the `Interface Segregation Principle`, we can solve that creating another interface, let's say `StackReader` e.g, and then in the `StackGenerator` class
we can implement both interfaces `StackReader and Stack` so that clients that don't need an specific method, in this case, `peek()` can implement only the "Stack" interface.

`StackReader.java`

```java
public interface StackReader {

    void peek();
}

```

`Stack.java`

```java
public interface Stack {

    void push (int data);

    void pop (int data);
}
```

`StackGenerator.java`

```java
public class StackGenerator implements Stack, StackReader {

    @Override
    public void push(int data) {

    }

    @Override
    public void pop(int data) {

    }

    @Override
    public void peek() {

    }
}
```
