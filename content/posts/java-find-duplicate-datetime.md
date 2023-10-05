+++
title = 'DateTime - Duplicates'
date = 1500-03-13T19:18:41-03:00
+++

Finding duplicate elements in a list of objects, filtering them out by date and time.

`PlantChecker.java`

```java
package io.tiago;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;


public class PlantChecker {

    public List<Plant> conflictChecker(List<Plant> plants) {

        List<Plant> conflicts = new ArrayList<>();

        for (int i = 0; i < plants.size(); i++) {

            Plant current = plants.get(i);

            for (int j = 0; j < plants.size(); j++) {

                if (j == i) {
                    continue;
                }

                Plant next = plants.get(j);

                if (current.getDate() != null && next.getDate() != null && current.getDate().toLocalDate().equals(next.getDate().toLocalDate())) {

                    LocalTime currentStartAt = current.getDate().toLocalTime();
                    LocalTime currentEndAt = current.getDate().toLocalTime().plusMinutes(current.getDuration());

                    LocalTime nextStartAt = next.getDate().toLocalTime();
                    LocalTime nextEndAt = next.getDate().toLocalTime().plusMinutes(next.getDuration());

                    if (current.getDate().toLocalTime().isBefore(next.getDate().toLocalTime())) {

                        if (nextStartAt.isBefore(currentEndAt)) {

                            conflicts.add(current);
                            break;
                        }

                    } else {

                        if (currentStartAt.isBefore(nextEndAt)) {
                            conflicts.add(current);
                            break;
                        }
                    }
                }
            }
        }

        return conflicts;
    }
}
```

`PlantApp.java`

```java
package io.tiago;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

public final class PlantApp {

    public static void main(String[] args) {

        List<Plant> plants = new ArrayList<>();

        for (int i = 0; i <= 10000; i++) {
            int year = getRandomInt(2000, 2080);
            int month = getRandomInt(1, 12);
            int day = getRandomInt(1, 28);

            int hour = getRandomInt(0, 12);
            int min = getRandomInt(0, 60);
            int sec = getRandomInt(0, 60);

            if (year > 2010) {
                plants.add(new Plant(getRandomNames(), new Long(getRandomInt(10, 60)), LocalDateTime.of(year, month, day, hour, min, sec)));
            }
            else {
                plants.add(new Plant(getRandomNames(), new Long(getRandomInt(10, 60)), null));
            }
        }

        PlantChecker plantChecker = new PlantChecker();
        List<Plant> resp = plantChecker.conflictChecker(plants);

        Comparator<Plant> comparator = (c1, c2) -> {
            return c1.getDate().compareTo(c2.getDate());
        };
        Collections.sort(resp, comparator);

        System.out.println(resp.size());
        resp.stream().forEach(System.out::println);
    }

    public static int getRandomInt(int min, int max) {
        Random random = new Random();
        return random.nextInt(max - min) + min;
    }

    public static String getRandomNames() {
        String[] plants = new String[] {"Bamboo", "Philodendron", "Cactus", "Eucalyptus", "Snake Plant",
                                        "Dahlia", "Orchid", "Fiddle-Leaf Fig", "Aeonium", "Air Plant"};

        return plants[getRandomInt(0, 5)];
    }

}
```

`Plant.java`

```java
package io.tiago;

import java.time.LocalDateTime;

public class Plant {

    // PLant's name
    private String name;

    // Duration of the light session
    private Long duration;

    // Light session start date
    private LocalDateTime date;

    public Plant(String name, Long duration, LocalDateTime date) {
        this.name = name;
        this.duration = duration;
        this.date = date;
    }

    public String getName() {
        return name;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
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
