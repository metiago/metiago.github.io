---
layout: post
title:  Java Design Pattern - Facade
date:   2019-02-15 20:18:00 +0100
category: Dev
tags: algorithm datastructure design
---


#### Concept

Provide a unified interface to a set of interfaces in a system. Facade defines a higher-level
interface that makes the subsystem easier to use

#### Example

We can think about a case where we use a method from a library. The user doesn’t care how the method is
implemented in the library. He/she just calls the method to serve his/her easy purpose. The pattern can be
best described by the example that follows.

```java
public class RobotFacade {

    RobotColor rc;
    RobotMetal rm;
    RobotBody rb;

    public RobotFacade() {
        rc = new RobotColor();
        rm = new RobotMetal();
        rb = new RobotBody();
    }

    public void ConstructRobot(String color, String metal) {
        System.out.println("\nCreation of the Robot Start");
        rc.SetColor(color);
        rm.SetMetal(metal);
        rb.CreateBody();
        System.out.println(" \nRobot Creation End");
        System.out.println();
    }
}
```

```java
public class RobotBody {
    public void CreateBody() {
        System.out.println("Body Creation done");
    }
}
```

```java
public class RobotColor {

    private String color;

    public void SetColor(String color) {
        this.color = color;
        System.out.println("Color is set to : " + this.color);
    }
}
```

```java
public class RobotMetal {

    private String metal;

    public void SetMetal(String metal) {
        this.metal = metal;
        System.out.println("Metal is set to : " + this.metal);
    }
}
```

```java
public class FacadePattern {

    public static void main(String[] args) {
        RobotFacade rf1 = new RobotFacade();
        rf1.ConstructRobot("Green", "Iron");
        RobotFacade rf2 = new RobotFacade();
        rf2.ConstructRobot("Blue", "Steel");
    }
}
```
