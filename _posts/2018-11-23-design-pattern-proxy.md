---
layout: default
title:  Java Design Pattern - Proxy
date:   2018-11-23 20:18:00 +0100
category: Dev
---

#### Concept

We want to use a class which can perform as an interface to something else.

#### Example

Consider an ATM implementation for a bank. Here we will find multiple proxy objects. Actual bank
information will be stored in a remote server. We must remember that in the real programming world, the
creation of multiple instances of a complex object (heavy object) is very costly. In such situations, we can
create multiple proxy objects (which must point to an original object) and the total creation of actual objects
can be carried out on a demand basis. Thus we can save both the memory and creational time.

```bash
public class ConcreteSubject extends Subject {

    @Override
    public void doSomeWork() {
        System.out.println(" I am from concrete subject");
    }
}
```


```bash
public class Proxy extends Subject {
    
    ConcreteSubject cs;

    @Override
    public void doSomeWork() {

        if (cs == null) {
            cs = new ConcreteSubject();
        }
        cs.doSomeWork();
    }
}
```


```bash
public abstract class Subject {
    public abstract void doSomeWork();
}
```


```bash
class ProxyDesignPattern {
    public static void main(String[] args) {
        Proxy px = new Proxy();
        px.doSomeWork();
    }
}
```

