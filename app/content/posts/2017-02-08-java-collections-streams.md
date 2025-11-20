---
title: 'Collections, Streams & Lambdas'
date: "2017-02-08"
draft: false

---

### Sorting Nulls
```java
// This method will sort by getCDKEYand then will sort by getVLRMX, if getCDKEY is null it'll sort by getVLRMN
private Optional<ZSDST0004Dto> getPolicyByGreaterCdKey(List<ZSDST0004Dto> policies) {
    return policies
            .stream()
            .max(Comparator.comparing(ZSDST0004Dto::getCDKEY)
                    .thenComparing(Comparator.comparing(ZSDST0004Dto::getVLRMX, Comparator.nullsFirst(Comparator.reverseOrder()))
                            .thenComparing(ZSDST0004Dto::getVLRMN, Comparator.nullsFirst(Comparator.reverseOrder()))));
}
```

### Count Duplicates 
```java
// counts the total number of duplicate CD keys in a list of ZSDST0004Dto objects by grouping and counting occurrences
private long isCdKeyDuplicated(List<ZSDST0004Dto> policies) {
    return policies.stream()
            .collect(Collectors.groupingBy(ZSDST0004Dto::getCDKEY, Collectors.counting()))
            .values().stream()
            .filter(count -> count > 1)
            .mapToInt(Long::intValue)
            .sum();
}
```

### Converting primitive arrays to List

```java
int[] nums = {1,2, 3}

List<Integer> intList1 = Arrays.asList(Arrays.stream(nums1).boxed().toArray(Integer[]::new));
```

### Remove duplicates based on single attribute

```java
List<Object> resultSet.stream().map(this::toDTO)
.collect(collectingAndThen(toCollection(() -> new TreeSet<>(comparing(Object::getFirstName))), ArrayList::new));
}
```

### Find the first non-repeated value

```java

public static void main(String[] args) {

    List<Integer> nums = List.of(1, 1, 2, 2, 3, 4, 4, 5, 5);

    Map<Integer, Integer> x = new LinkedHashMap<>();

    for (int i = 0; i < nums.size(); i++) {
        Integer n = nums.get(i);
        if (!x.containsKey(n)) {
            x.put(n, 1);
        } else {
            Integer v = x.get(n);
            x.put(n, v + 1);
        }
    }

    for (Map.Entry<Integer, Integer> entry : x.entrySet()) {

        if (entry.getValue() <= 1) {
            System.out.println(entry.getKey());
            break;
        }
    }
} 
```

### Count duplicates

```java
import java.util.*;
import java.util.stream.Collectors;

public class StreamCountDuplicateElements {

    public static void main(String[] args) {

        List<String> input = List.of("1", "1", "5" ,"4" ,"2" ,"1");

        Map<Integer, Integer> m = input.stream()
                                       .map(Integer::parseInt)
                                       .collect(Collectors.toMap(i-> i, i -> 1, Integer::sum));
        System.out.println(m);
    }
}
```

### Samples

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

        // SORT ASC
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

`Feed.java`

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

`Animal.java`

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

`ArrayChunk.java`

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

public class ArrayChunk {

    private static final int NUM_OF_CHUNKS = 4;

    private static final List<Integer> arr = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 20, 30, 80);

    public static void main(final String... argvs) {

        final List<List<Integer>> result = new ArrayList<>();

        final AtomicInteger counter = new AtomicInteger();

        for (final int number : arr) {

            if (counter.getAndIncrement() % NUM_OF_CHUNKS == 0) {
                result.add(new ArrayList<>());
            }
            result.get(result.size() - 1).add(number);
        }

        System.out.println(result);
    }
    
}
```

##### Map

```java
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class LoopMap {

    public static void main(String[] args) {

        Map<String, String> map = new HashMap<>();
        map.put("1", "Jan");
        map.put("2", "Feb");
        
        // tradional loop
        for (Map.Entry<String, String> entry : map.entrySet()) {
            System.out.println("Key : " + entry.getKey() + " Value : " + entry.getValue());
        }
        
        // lambda
        map.forEach((k, v) -> System.out.println("Key : " + k + " Value : " + v));
    }
}
```

##### Shuffle List

```java

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ShuffleArray {

	public static void main(String[] args) {

		Integer[] intArray = { 1, 2, 3, 4, 5, 6, 7};

		// Arrays.asList() works with an array of objects 
		// only because autoboxing doesn’t work with generics.
		List<Integer> intList = Arrays.asList(intArray);

		Collections.shuffle(intList);

		intList.toArray(intArray);

		System.out.println(Arrays.toString(intArray));
	}
}

```

```java 
import java.util.Arrays;
import java.util.Random;

public class ShuffleArray {

	public static void main(String[] args) {
		
		int[] array = { 1, 2, 3, 4, 5, 6, 7 };
		
		Random rand = new Random();
		
		for (int i = 0; i < array.length; i++) {
			int randomIndexToSwap = rand.nextInt(array.length);
			int temp = array[randomIndexToSwap];
			array[randomIndexToSwap] = array[i];
			array[i] = temp;
		}
		System.out.println(Arrays.toString(array));
	}
}
```
