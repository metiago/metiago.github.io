---
layout: post
title:  Java Design Pattern - Template
date:   2018-12-02 20:18:00 +0100
category: Dev
tags: algorithm datastructure design
---

## Template Design Pattern

#### Concept

GoF Definition: Define the skeleton of an algorithm in an operation, deferring some steps to subclasses. The
template method lets subclasses redefine certain steps of an algorithm without changing the algorithm’s structure.

In a template method, we define the minimum or essential structure of an algorithm. Then we defer some
functionalities (responsibilities) to the subclasses. As a result, we can redefine certain steps of an algorithm
by keeping the key structure fixed for that algorithm.

#### Example

For an engineering student, in general, most of the subjects in the first semester are common for all
concentrations. Later, additional papers are added in his/her course based on his/her specialization
(Computer Science, Electronics, etc.).


```java
public abstract class BasicEngineering {

    public void Papers() {
        Math();
        SoftSkills();
        SpecialPaper();
    }

    private void Math() {
        System.out.println("Mathematics");
    }

    private void SoftSkills() {
        System.out.println("SoftSkills");
    }

    public abstract void SpecialPaper();
}
```

```java
public class ComputerScience extends BasicEngineering {

    @Override
    public void SpecialPaper() {
        System.out.println("Object Oriented Programming");
    }
}

```

```java
public class Electronics extends BasicEngineering {

    @Override
    public void SpecialPaper() {
        System.out.println("Digital Logic and Circuit Theory");
    }
}
```

```java
public class TemplateMethodPatternEx {

    public static void main(String[] args) {
        System.out.println("***Template Method Pattern Demo***\n");
        BasicEngineering bs = new ComputerScience();
        System.out.println("Computer Sc Papers:");
        bs.Papers();
        System.out.println();
        bs = new Electronics();
        System.out.println("Electronics Papers:");
        bs.Papers();
    }
}
```
