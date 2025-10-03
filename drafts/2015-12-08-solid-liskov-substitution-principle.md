---
title: 'Liskov Substitution Principle'
date: "2015-12-08"
draft: false

---

This principle states that derived classes must be substitutable for the base class.

### Example

`Animal.java`

```java
public class Animal {

    private String name;

    private int numOfLegs;

    void countLegs() {

    }
}
```

`Dog.java`

```java
public class Dog extends Animal {

    @Override
    void countLegs() {
        // LOGIC
    }

}
```

`Snake.java`

```java
public class Snake extends Animal {

    @Override
    void countLegs() {
        // SNAKES HAVE NO LEGS
    }
}
```

At this point, we can see that, although snake is an animal, the method cannot be implemented because snakes don't have any legs. 
These are the kinds of problems that violates `Liskov Substitution Principle` and they can be recognized by a method that does nothing 
or can’t be implemented e.g.

Therefore, to fix this issue, we have to implement a correct inheritance between objects.

### Example

`Animal.java`

```java
public class Animal {

    private String name;

    private int numOfLegs;
}
```

`AnimalNoLegs.java`

```java
public class AnimalNoLegs extends Animal {

    void crawl() {

    }
}
```

`AnimalWithLegs.java`

```java
public class AnimalWithLegs extends Animal {

    void countLegs() {

    }
}
```

`Dog.java`

```java
public class Dog extends AnimalWithLegs {

    @Override
    void countLegs() {
        // LOGIC
    }

}
```

`Snake.java`

```java
public class Snake extends AnimalNoLegs {

    @Override
    void crawl() {
        // SNAKES HAVE NO LEGS
    }
}
```

After these changes, we can see that our classes Dog and Snake are more specialized while adhering to the Liskov Substitution Principle.
