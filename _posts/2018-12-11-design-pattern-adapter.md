---
layout: default
title:  Java Design Pattern - Adapter
date:   2018-11-21 20:18:00 +0100
category: Dev
---

## Adapter Design Pattern

#### Concept

Convert the interface of a class into another interface that clients expect. The adapter
pattern lets classes work together that couldn’t otherwise because of incompatible interfaces.

#### Example

In real-life development, in many cases, we cannot communicate between two interfaces directly. They
contain some kind of constraint within themselves. To deal with this kind of incompatibility between those
interfaces, we may need to introduce adapters.


```java
class Triangle {

    public double base;
    public double height;

    public Triangle(int base, int height) {
        this.base = base;
        this.height = height;
    }
}
```

```java
class Rect {
    public double l;
    public double w;
}
```

```java
class CalculatorAdapter {
    Calculator calculator;
    Triangle triangle;

    public double getArea(Triangle t) {
        calculator = new Calculator();
        triangle = t;
        Rect r = new Rect();
        //Area of Triangle=0.5*base*height
        r.l = triangle.base;
        r.w = 0.5 * triangle.height;
        return calculator.getArea(r);
    }
}
```

```java
class Calculator {

    Rect rectangle;

    public double getArea(Rect r) {
        rectangle = r;
        return rectangle.l * rectangle.w;
    }
}
```

```java
public class AdapterPattern {

    public static void main(String[] args) {
        System.out.println("***AdapterPattern Pattern Demo***");
        CalculatorAdapter cal = new CalculatorAdapter();
        Triangle t = new Triangle(20, 10);
        System.out.println("\nAdapterPattern Pattern Example\n");
        System.out.println("Area of Triangle is :" + cal.getArea(t));
    }
}
```
