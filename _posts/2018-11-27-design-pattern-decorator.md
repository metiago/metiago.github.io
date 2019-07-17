---
layout: default
title:  Java Design Pattern - Decorator
date:   2018-11-27 20:18:00 +0100
category: Dev
---

## Decorator Design Pattern

#### Concept

This main principle of this pattern says that we cannot modify existing functionalities but we can extend
them. In other words, this pattern is open for extension but closed for modification. The core concept
applies when we want to add some specific functionalities to some specific object instead of to the
whole class.

#### Example

Suppose in a GUI-based toolkit, we want to add some border properties. We can do this by inheritance. But
it cannot be treated as the best solution because our user or client cannot have absolute control from the
creation. The core of that choice is static there.
Decorator can offer us a more flexible approach: here we may surround the component in another
object. The enclosing object is termed “decorator.” It conforms to the interface of the component it
decorates. It forwards requests to the component. It can perform additional operations before or after those
forwarding requests. An unlimited number of responsibilities can be added with this concept.

```java

package jdp.decorator;

abstract class Component {
    public abstract void doJob();

}

class ConcreteComponent extends Component {

    @Override
    public void doJob() {
        System.out.println("I am from concrete component closed for modification.");

    }
}

abstract class AbstractDecorator extends Component {

    private Component com;

    public void SetTheComponent(Component c) {
        com = c;
    }

    public void doJob() {
        if (com != null) {
            com.doJob();
        }
    }
}

class ConcreteDecoratorEx_1 extends AbstractDecorator {

    public void doJob() {
        super.doJob();
        System.out.println("I am  EX_1");
    }
}

class ConcreteDecoratorEx_2 extends AbstractDecorator {

    public void doJob() {        
        super.doJob();
        System.out.println("I am EX_2");
    }
}

class DecoratorPattern {

    public static void main(String[] args) {
        ConcreteComponent cc = new ConcreteComponent();
        ConcreteDecoratorEx_1 cd_1 = new ConcreteDecoratorEx_1();
        cd_1.SetTheComponent(cc);
        cd_1.doJob();
        ConcreteDecoratorEx_2 cd_2 = new ConcreteDecoratorEx_2();
        cd_2.SetTheComponent(cd_1);
        cd_2.doJob();
    }
}

```

