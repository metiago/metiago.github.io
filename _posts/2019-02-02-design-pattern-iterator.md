---
layout: default
title:  Java Design Pattern - Iterator
date:   2019-02-02 20:18:00 +0100
category: Dev
---

## Iterator Design Pattern


#### Concept

Iterators are generally used to traverse a container to access its elements.

#### Example

Similarly, say, in a college, the arts department may use array data structure and the science department
may use linked list data structure to store their students’ records. The main administrative department will
access those data through the common methods—it doesn’t care which data structure is used by individual
departments.

```bash
public interface IIterator {

    void first();//Reset to first element

    String next();//get next element

    Boolean isDone();//End of collection check

    String currentItem();//Retrieve Current Item
}
```

```bash
public interface ISubject {

    IIterator createIterator();
}
```

```bash
public class Science implements ISubject {

    private LinkedList<String> subjects;

    public Science() {
        subjects = new LinkedList<>();
        subjects.addLast("Maths");
        subjects.addLast("Comp. Sc.");
        subjects.addLast("Physics");
    }

    @Override
    public IIterator createIterator() {
        return new ScienceIterator(subjects);
    }

    public class ScienceIterator implements IIterator {

        private LinkedList<String> subjects;

        private int position;

        public ScienceIterator(LinkedList<String> subjects) {
            this.subjects = subjects;
            position = 0;
        }

        public void first() {
            position = 0;
        }

        public String next() {
            return subjects.get(position++);
        }

        public Boolean isDone() {
            return position >= subjects.size();
        }

        public String currentItem() {
            return subjects.get(position);
        }
    }
}

```

```bash
public class Arts implements ISubject {

    private String[] subjects;

    public Arts() {
        subjects = new String[2];
        subjects[0] = "Bengali";
        subjects[1] = "English";
    }

    public IIterator createIterator() {
        return new ArtsIterator(subjects);
    }

    public class ArtsIterator implements IIterator {

        private String[] subjects;
        private int position;

        public ArtsIterator(String[] subjects) {
            this.subjects = subjects;
            position = 0;
        }

        public void first() {
            position = 0;
        }

        public String next() {
            return subjects[position++];
        }

        public Boolean isDone() {
            return position >= subjects.length;
        }

        public String currentItem() {
            return subjects[position];
        }
    }
}
```

```bash
public class IteratorPattern {

    public static void main(String[] args) {

        ISubject Sc_subject = new Science();
        ISubject Ar_subjects = new Arts();
        IIterator Sc_iterator = Sc_subject.createIterator();
        IIterator Ar_iterator = Ar_subjects.createIterator();

        System.out.println("\nScience subjects :");
        print(Sc_iterator);

        System.out.println("\nArts subjects :");
        print(Ar_iterator);
    }

    public static void print(IIterator iterator) {
        while (!iterator.isDone()) {
            System.out.println(iterator.next());
        }
    }
}
```
