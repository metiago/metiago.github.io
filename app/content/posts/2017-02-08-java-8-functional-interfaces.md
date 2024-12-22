---
title: 'Java Functional Interfaces'
date: "2017-04-08"
draft: false
image: "https://placehold.co/600x400"
---

### Predicate

```java
public class PredicateExample {

    public static void main(String[] args){
      IntPredicate isGreaterThan = age -> age > 0;
      var items = List.of(1,2,3,-1,4, -33);
      items.stream().filter(isGreaterThan::test).forEach(System.out::println);
    }
}
```

### Bi Predicate

```java
// Instead of one argument, BiPredicate will accept two arguments and return boolean.
public class BiPredicateExample {

    public static void main(String[] args) {
        BiPredicate<String, Integer> validAnimal = (name, age) -> name.length() > 0 && age > 0;
        var items = Map.of("mouse", 1, "bat", -1000, "racoon", 2);
        items.entrySet().stream()
        .filter(m -> validAnimal.test(m.getKey(), m.getValue()))
        .forEach(System.out::println);
    }
}
```

### Consumer

The Consumer interface accepts one argument, but there is no return value.

```java
public class ConsumerExample {

    static List<String> pets = new ArrayList<>();

    static Consumer<String> check = (name) -> {
        if (name.startsWith("_")) {
            pets.add(name);
        }
    };

    public static void main(String[] args) {
        List<String> db = List.of("_dogs", "cats", "_birds");
        db.forEach(check);
        pets.forEach(name -> {
            System.out.println("Name: " + name);
        });
    }
}
```

### Bi Consumer
It is the extension of the Consumer, which is BiConsumer, accepts two arguments and returns nothing.

```java
public class BiConsumerExample {

    static Map<String, Integer> results = new HashMap<>();

    static BiConsumer<String, Integer> concat = (name, projects) -> {
        results.put(name, projects);
    };

    public static void main(String[] args) {
        var astros = List.of("sun", "moon");

        astros.forEach(astro -> {
            concat.accept(astro, 1);
        });

        System.out.println(results);
    }
}
```

### Function

This interface accepts one argument and returns a value after the required processing. 
It is defined as below. The required processing logic will be executed on the invocation of the apply method.

```java
public class FunctionExample {

    public static void main(String[] args) {

        Function<String, String> isValid = (name) -> {
            if (name.length() > 5) {
                return name + " - YES";
            } else {
                return name + " - NO";
            }
        };

        var data = List.of("dogs", "cats", "birds", "sharks", "elephants");
        data.stream()
            .map(isValid::apply)
            .forEach(System.out::println);
    }
}
```

### Bi Function 

The BiFunction is similar to Function except it accepts two inputs, whereas Function accepts one argument. The sample code for the BiFunction interface is given below.
In the below interface code T and U are the inputs and R is the single output.

```java
public class BiFunctionExample {

    public static void main(String[] args) {

        BiFunction<String, Integer, String> isValid = (name, age) -> {
            if (name.length() > 5 && age > 0) {
                return name + " - YES";
            } else {
                return name + " - NO";
            }
        };

        var data = Map.of("dogs", -3, "cats", 6, "birds", -10, "sharks", 2, "elephants", -9);
        data.entrySet().stream()
                       .map(m -> isValid.apply(m.getKey(), m.getValue()))
                       .forEach(System.out::println);
    }
}
```

### Supplier

Supplier functional interface does not accept any input and returns a single output

```java
public class SupplierExample {

    public static void main(String[] args) {
        Supplier<String> helloWorld = () -> "Hello World";
        System.out.println(helloWorld.get());
    }
}
```

### UnaryOperator

UnaryOperator accepts a single argument and return a single argument, but both the input and output argument should be of same or similar type.

```java
public class UnaryOperatorExample {

    public static void main(String[] args)
    {
        UnaryOperator<String> unaryOperatorStr = (str) -> str.concat(" Unary Operator");

        System.out.println(unaryOperatorStr.apply("Java8"));

    }
}
```

### BinaryOperator

BinaryOperator accepts two arguments and returns one argument similar to BiFunction, 
but the type of all the input and output argument should be of similar type.

```java
import java.util.function.BinaryOperator;

public class BinaryOperatorExample {

    public static void main(String[] args){

        BinaryOperator<Integer>  binaryOperatorAdd2No = (a,b) -> a + b;

        System.out.println(binaryOperatorAdd2No.apply(2,5));

    }
}
```
