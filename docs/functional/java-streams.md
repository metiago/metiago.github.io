# Streams & Lambdas

```java
public static void main(String[] args) {

        final var numbers = List.of(1, 2, 3, 2);

        Map<Integer, Integer> freq = new HashMap<>();

        for (Integer e : numbers) {

            if (freq.containsKey(e)) {
                Integer v = freq.get(e);
                freq.put(e, v + 1);
            } else {
                freq.put(e, 1);
            }

        }

        Optional<Integer> max = freq.entrySet()
                .stream()
                .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                .map(m -> m.getKey())
                .findFirst();

        System.out.println(max.get());
    }
```

Get frequency of an element in array
```java
import java.util.*;
import java.util.stream.Collectors;

public class StreamCountDuplicateElements {

    public static void main(String[] args) {

        List<String> input = List.of("1", "1", "5" ,"4" ,"2" ,"1");

        Map<Integer, Integer> m = input.stream()
                                       .map(Integer::parseInt)
                                       .collect(Collectors.toMap(i-> i, i -> 1, Integer::sum));
        // output: {1=3, 2=1, 4=1, 5=1}
    }
}
```

Trying it out

```java
package com.tiago.javacore;

import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

public class JavaStreamSamples {

    public static void main(String[] args) {

        List<Animal> animals = new ArrayList<>();

        for (int i = 0; i < 35; i++) {
            int id = Feed.getIds();
            int age = Feed.getAge();
            String scientificName = String.valueOf(Feed.animalsNames().get(new Random().nextInt(Feed.nimalsNames().size())));
            String status = String.valueOf(Feed.status().get(new Random().nextInt(Feed.status().size())));
            String veterinarian = String.valueOf(Feed.veterinarians().get(new Random().nextInt(Feed.veterinarians().size())));
            Date created = new Date(Feed.getRandomTimeBetweenTwoDates());

            animals.add(new Animal(id, scientificName, status, veterinarian, created, age));
        }

        // FOREACH
        animals.forEach((animal) -> System.out.println(animal.getScientificName()));

        // FILTER GT THAN 18
        animals.stream().filter((animal) -> animal.getAge() > 18).forEach(animal -> System.out.println(animal.getScientificName()));

        // SORTED
        List<Animal> s = animals.stream().sorted(Comparator.comparing(Animal::getAge)).collect(toList());

        // SORT ASC USING COMPARATOR
        animals.sort((Animal animal, Animal b) -> animal.getScientificName().compareTo(b.getScientificName()));

        // SORT ASC USING METHOD REFERENCE
        animals.sort(Comparator.comparing(Animal::getAge));

        // SORT DESC COMPARATOR
        animals.sort((Animal animal, Animal b) -> b.getAge().compareTo(animal.getAge()));

        // SORT DESC
        List<Animal> v = animals.stream().sorted((Animal a, Animal b) -> b.getAge().compareTo(a.getAge())).collect(toList());

        // COMPARING INT TO AVOID AUTOBOXING AND USE THEN COMPARING TO COMPARE WITH ANOTHER FIELD
        Comparator.comparingInt(Animal::getAge).thenComparing(Animal::getScientificName);

        // CREATE A CHAIN OF STREAMS
        Consumer<Animal> info = animal -> System.out.print("Animal's name: ");
        Consumer<Animal> animalsNames = animal -> System.out.println(animal.getScientificName());
        animals.forEach(info.andThen(animalsNames));

        // REMOVE IF
        animals.removeIf(animal -> animal.getAge() < 18);

        // COLLECT AS LIST
        List<Animal> listAnimals = animals.stream().filter(animal -> animal.getAge() > 18).collect(toList());

        // COLLECT AS SET
        Set<Animal> setAnimals = animals.stream().filter(animal -> animal.getAge() > 1).collect(toSet());

        List<Integer> ages = animals.stream().map(Animal::getAge).filter(age -> age < 18).collect(toList());

        // MAP TO INT -- TO AVOID OVERHEADS
        IntStream stream = animals.stream().mapToInt(Animal::getAge);

        // MAP DOUBLE
        double average = animals.stream().mapToInt(Animal::getAge).average().getAsDouble();

        // MAP TO OPTIONAL DOUBLE
        double orElse = animals.stream().filter(animal -> animal.getAge() > 30).mapToInt(Animal::getAge).average().orElse(0.0);

        OptionalDouble optionalDouble = animals.stream().filter(animal -> animal.getAge() > 30).mapToInt(Animal::getAge).average();
        animals.stream().mapToInt(Animal::getAge).average().ifPresent(valor -> System.err.println("Error"));
        // animals.stream().filter(animal -> animal.getAge() > 30).mapToInt(Animal::getAge).average().orElseThrow(IllegalStateException::new);

        // REDUCE
        double averageAges = animals.stream().mapToInt(Animal::getAge).average().getAsDouble();
        System.out.println(average);
        int animal = 0, b = 10;
        IntStream.range(animal, b).forEach(System.out::println);

        // TO MAP
        Map<Integer, Animal> aMap = animals.stream().distinct().collect(Collectors.toMap(Animal::getAge, Function.identity()));

        // Collectors.groupingBy() – Duplicate Map Keys
        Map<Integer, List<Animal>> groupBy = animals.stream().collect(Collectors.groupingBy(Animal::getAge));

        System.out.println("DONE");
    }
}

```

Sample data generator

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

        long beginTime = Timestamp.valueOf("2013-01-01T19:18:41-03:00").getTime();
        long endTime = Timestamp.valueOf("2013-12-31 00:58:00").getTime();
        long diff = endTime - beginTime + 1;
        return beginTime + (long) (Math.random() * diff);
    }
}
```

The POJO

```java
import java.io.Serializable;
import java.util.Date;


public class Animal implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;

    private String scientificName;

    private String status;

    private String veterinarian;

    private Date created;

    private Integer age;

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
}
```