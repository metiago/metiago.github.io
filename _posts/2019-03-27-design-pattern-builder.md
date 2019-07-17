---
layout: default
title:  Java Design Pattern - Builder
date:   2019-03-27 20:18:00 +0100
category: Dev
---

## Builder Design Pattern


#### Concept

Separate the construction of a complex object from its representation so that the same
construction processes can create different representations.

#### Example

We sometimes need to convert one text format to another text format (e.g., RTF to ASCII text).


```java
interface IBuilder {

    void BuildBody();
    void InsertWheels();
    void AddHeadlights();
    Product GetVehicle();
}
```

```java
public class Product {

    private LinkedList<String> parts;

    public Product() {
        parts = new LinkedList<String>();
    }

    public void add(String part) {
        parts.addLast(part);
    }

    public void show() {

        for (int i = 0; i < parts.size(); i++) {
            System.out.println(parts.get(i));
        }
    }
}
```

```java
public class MotorCycle implements IBuilder {

    private Product product = new Product();

    @Override
    public void BuildBody() {
        product.add("This is a body of a Motorcycle");
    }

    @Override
    public void InsertWheels() {
        product.add("2 wheels are added");
    }

    @Override
    public void AddHeadlights() {
        product.add("1 Headlights are added");
    }

    @Override
    public Product GetVehicle() {
        return product;
    }
}
```

```java
public class Director {

    IBuilder myBuilder;

    public void Construct(IBuilder builder) {
        myBuilder = builder;
        myBuilder.BuildBody();
        myBuilder.InsertWheels();
        myBuilder.AddHeadlights();
    }
}
```

```java
public class Car implements IBuilder {

    private Product product = new Product();

    @Override
    public void BuildBody() {
        product.add("This is a body of a Car");
    }

    @Override
    public void InsertWheels() {
        product.add("4 wheels are added");
    }

    @Override
    public void AddHeadlights() {
        product.add("2 Headlights are added");
    }

    @Override
    public Product GetVehicle() {
        return product;
    }
}
```

```java
public class Demo {

    public static void main(String[] args) {

        Director director = new Director();
        IBuilder carBuilder = new Car();
        IBuilder motorBuilder = new MotorCycle();

        director.Construct(carBuilder);
        Product p1 = carBuilder.GetVehicle();
        p1.show();

        director.Construct(motorBuilder);
        Product p2 = motorBuilder.GetVehicle();
        p2.show();
    }
}
```