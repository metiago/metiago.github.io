---
layout: post
title:  Java Design Pattern - Factory
date:   2019-03-22 20:18:00 +0100
category: Dev
tags: algorithm datastructure design
---

## Factory Design Pattern


#### Concept

Define an interface for creating an object, but let subclasses decide which class to
instantiate. The factory method lets a class defer instantiation to subclasses.

#### Example

In a Windows application, we may have different database users (e.g., one user uses Oracle and one may use
Sql Server). Now whenever we need to insert data in our database we need to create either an SqlConnection
or an OracleConnection first; only then we can proceed. If we put them into simple if-else, we need to
repeat lots of codes and it doesn’t look good. We can use the factory pattern to solve these types of problems.
The basic structure is defined with an abstract class; our subclasses will be derived from this class. The
subclasses will take the responsibility of the instantiation process.

```java
public interface IAnimal {
    void Speak();
}
```

```java
abstract class IAnimalFactory {

    public abstract IAnimal

    GetAnimalType(String type) throws Exception;
}
```

```java
public class Tiger implements IAnimal {

    @Override
    public void Speak() {
        System.out.println("Tiger says hrrm, hrrm");
    }
}
```

```java
public class Duck implements IAnimal {
    @Override
    public void Speak() {
        System.out.println("Duck says quak, quak");
    }

}
```

```java
public class ConcreteFactory extends IAnimalFactory {

    @Override
    public IAnimal GetAnimalType(String type) throws Exception {
        switch (type) {
            case "Duck":
                return new Duck();
            case "Tiger":
                return new Tiger();
            default:
                throw new Exception("Animal type : " + type + " cannot be instantiated");
        }
    }
}
```

```java
public class Demo {

    public static void main(String[] args) throws Exception {

        IAnimalFactory animalFactory = new ConcreteFactory();
        IAnimal DuckType = animalFactory.GetAnimalType("Duck");
        DuckType.Speak();
        IAnimal TigerType = animalFactory.GetAnimalType("Tiger");
        TigerType.Speak();
        IAnimal LionType = animalFactory.GetAnimalType("Lion");
        LionType.Speak();
    }
}
```