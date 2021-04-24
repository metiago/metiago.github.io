---
layout: post
title:  Java 8 Lambdas and Streams
date:   2017-07-11 20:18:00 +0100
category: Dev
tags: java lambda streams
---

## Java 8 Lambdas and Streams - JDK 8+

Quick reference about some Java Lambda and Streams

##### Main References - JavaStreams.java

```java
package com.tiago.javacore;

import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

public class JavaStreams {

    public static void main(String[] args) {

        List<Animal> animals = new ArrayList<>();

        for (int i = 0; i < 5; i++) {

            int id = Feed.getIds();
            int age = Feed.getAge();
            String scientificName = String.valueOf(Feed.animalsNames().get(new Random().nextInt(Feed.animalsNames().size())));
            String status = String.valueOf(Feed.status().get(new Random().nextInt(Feed.status().size())));
            String veterinarian = String.valueOf(Feed.veterinarians().get(new Random().nextInt(Feed.veterinarians().size())));
            Date created = new Date(Feed.getRandomTimeBetweenTwoDates());

            animals.add(new Animal(id, scientificName, status, veterinarian, created, age));
        }

        // FOREACH
        animals.forEach((animal) -> System.out.println(animal.getScientificName()));

        // FILTER GT THAN 18
        animals.stream().filter((animal) -> animal.getAge() > 18).forEach(animal -> System.out.println(animal.getScientificName()));

        // SORT ASC USING COMPARATOR
        animals.sort((Animal animal, Animal b) -> animal.getScientificName().compareTo(b.getScientificName()));

        // SORT ASC USING METHOD REFERENCE
        animals.sort(Comparator.comparing(Animal::getScientificName));

        // SORT DESC
        animals.sort((Animal animal, Animal b) -> b.getScientificName().compareTo(animal.getScientificName()));

        // COMPARING INT TO AVOID AUTOBOXING AND USE THEN COMPARING TO COMPARE WITH ANOTHER FIELD
        Comparator<Animal> c = Comparator.comparingInt(Animal::getAge).thenComparing(Animal::getScientificName);

        // REVERSING
        Comparator<Animal> d = Comparator.comparingInt(Animal::getAge).thenComparing(Animal::getScientificName).reversed();

        // Create a chain of streams        
        Consumer<Animal> info = animal -> System.out.print("Animal's name: ");
        Consumer<Animal> animalsNames = animal -> System.out.println(animal.getScientificName());
        animals.forEach(info.andThen(animalsNames));

        // REMOVE IF
        animals.removeIf(animal -> animal.getAge() < 18);

        // STREAMING
        animals.stream().filter(animal -> animal.getAge() < 18).forEach(animal -> System.out.println("LT: " + animal.getScientificName()));

        // COLLECT AS LIST
        List<Animal> listAnimals = animals.stream().filter(animal -> animal.getAge() > 18).collect(toList());
        
        // COLLECT AS SET
        Set<Animal> setAnimals = animals.stream().filter(animal -> animal.getAge() > 1).collect(toSet());
        
        // GET animal SPECIFIC TYPE OF SET
        Set<Animal> set = animals.stream().collect(Collectors.toCollection(HashSet::new));

        // MAP
        List<Integer> ages = animals.stream().filter(animal -> animal.getAge() < 18).map(Animal::getAge).collect(toList());
        
        // MAP TO INT -- TO AVOID OVERHEADS
        IntStream stream = animals.stream().mapToInt(Animal::getAge);

        // MAP DOUBLE
        double average = animals.stream().mapToInt(Animal::getAge).average().getAsDouble();
        
        // MAP TO OPTIONAL DOUBLE
        double orElse = animals.stream().filter(animal -> animal.getAge() > 30).mapToInt(Animal::getAge).average().orElse(0.0);

        OptionalDouble optionalDouble = animals.stream().filter(animal -> animal.getAge() > 30).mapToInt(Animal::getAge).average();
        animals.stream().mapToInt(Animal::getAge).average().ifPresent(valor -> System.err.println("Error"));
        animals.stream().filter(animal -> animal.getAge() > 30).mapToInt(Animal::getAge).average().orElseThrow(IllegalStateException::new);

        // SORTED
        animals.stream().filter(animal -> animal.getAge() > 18).sorted(Comparator.comparing(Animal::getScientificName)).forEach(animal -> System.out.println(animal.getScientificName()));

        // REDUCE
        double averageAges = animals.stream().mapToInt(Animal::getAge).average().getAsDouble();
        System.out.println(average);
        int animal = 0, b = 10;
        IntStream.range(animal, b).forEach(System.out::println);
    }
}

```

##### A feed class to provide random data to play with - Feed.java

```java
package com.tiago.javacore;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class Feed {

    public static int getIds() {
        return new Random().nextInt(Integer.SIZE - 1);
    }

    public static int getAge() {
        return new Random().nextInt(Integer.SIZE - 1);
    }

    public static List<String> animalsNames() {

        List<String> asList = new ArrayList<>();
        asList.add("Panthera pardus orientalis");
        asList.add("Pongo pygmaeus");
        asList.add("Diceros bicornis");
        asList.add("Gorilla beringei graueri");
        asList.add("Lycaon pictus");
        asList.add("Panthera tigris tigris");
        asList.add("Elephas maximus indicus");
        asList.add("Mustela nigripes");
        asList.add("Spheniscus mendiculus");
        asList.add("Ateles paniscus");

        return asList;
    }

    public static List<String> status() {
        return Arrays.asList("good", "bad");
    }

    public static List<String> veterinarians() {
        return Arrays.asList("Tiago", "Ziggy", "Be", "Fran", "John");
    }

    public static long getRandomTimeBetweenTwoDates() {

        long beginTime = Timestamp.valueOf("2013-01-01 00:00:00").getTime();
        long endTime = Timestamp.valueOf("2013-12-31 00:58:00").getTime();
        long diff = endTime - beginTime + 1;
        return beginTime + (long) (Math.random() * diff);
    }
}
```

##### Simple POJO - Animal.java

```java

package com.tiago.javacore;

import java.io.Serializable;
import java.util.Date;


public class Animal implements Serializable {

    private static final long serialVersionUID = 1L;


    private int id;

    private String scientificName;

    private String status;

    private String veterinarian;

    private Date created;

    private int age;

    public Animal() {
    }

    public Animal(int id, String scientificName, String status, String veterinarian, Date created, int age) {
        this.id = id;
        this.scientificName = scientificName;
        this.status = status;
        this.veterinarian = veterinarian;
        this.created = created;
        this.age = age;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVeterinarian() {
        return veterinarian;
    }

    public void setVeterinarian(String veterinarian) {
        this.veterinarian = veterinarian;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```