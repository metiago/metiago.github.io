+++
title =  'Duplicate Dates'
date = 1500-03-12T19:18:41-03:00
+++

Finding duplicate elements in a list of objects, filtering them out by dates.

`FlowerChecker.java`

```java
package io.tiago;

import java.util.ArrayList;
import java.util.List;

public class FlowerChecker {


    public List<Flower> dateConflictChecker(List<Flower> flowers) {

        List<Flower> conflicts = new ArrayList<>();

        for (int i = 0; i < flowers.size(); i++) {

            Flower current = flowers.get(i);

            for (int j = 0; j < flowers.size(); j++) {

                if (j == i) {
                    continue;
                }

                Flower next = flowers.get(j);

                if (current.getDate() != null && current.getDate().equals(next.getDate())) {
                    conflicts.add(current);
                    break;
                }
            }
        }

        return conflicts;
    }

}
```

`FlowerApp.java`

```java
package io.tiago;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

public final class FlowerApp {

    public static void main(String[] args) {

        List<Flower> flowers = new ArrayList<>();

        for (int i = 0; i <= 100; i++) {
            int year = getRandomNumberUsingNextInt(2008, 2030);
            int month = getRandomNumberUsingNextInt(1, 12);
            int day = getRandomNumberUsingNextInt(1, 28);

            if (year > 2010) {
                flowers.add(new Flower(getRandomPlantName(), 45L, LocalDate.of(year, month, day)));
            } else {
                flowers.add(new Flower(getRandomPlantName(), 45L, null));
            }
        }

        FlowerChecker flowerChecker = new FlowerChecker();
        List<Flower> resp = flowerChecker.dateConflictChecker(flowers);

        Comparator<Flower> comparator = (c1, c2) -> {
            return c1.getDate().compareTo(c2.getDate());
        };
        Collections.sort(resp, comparator);

        resp.stream().forEach(System.out::println);
    }

    public static int getRandomNumberUsingNextInt(int min, int max) {
        Random random = new Random();
        return random.nextInt(max - min) + min;
    }

    public static String getRandomPlantName() {
        String[] plants = new String[] { "Abutilon", "Abutilon", "Aconite", "Bee Balm", "Bergenia",
                "Borage", "Bottlebrush", "Calendula", "Chicory", "Coneflower" };

        return plants[getRandomNumberUsingNextInt(0, 5)];
    }
}
```

`Flower.java`

```java
package io.tiago;

import java.time.LocalDate;

public class Flower {

    // Flower's name
    private String name;

    // Duration of the light session
    private Long duration;

    // Light session start date
    private LocalDate date;

    public Flower(String name, Long duration, LocalDate date) {
        this.name = name;
        this.duration = duration;
        this.date = date;
    }

    public String getName() {
        return name;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getDuration() {
        return duration;
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Plant [date=" + date + ", duration=" + duration + ", name=" + name + "]";
    }
}
```
