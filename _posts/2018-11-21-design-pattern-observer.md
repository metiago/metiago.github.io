---
layout: default
title:  Java Design Pattern - Observer
date:   2018-11-21 20:18:00 +0100
category: Dev
---

#### Concept

In this pattern, there are many observers (objects) which are observing a particular subject (object).
Observers are basically interested and want to be notified when there is a change made inside that subject.
So, they register themselves to that subject. When they lose interest in the subject they simply unregister
from the subject. Sometimes this model is also referred to as the Publisher-Subscriber model.

#### Example

In the world of computer science, consider a simple UI-based example, where this UI is connected with
some database (or business logic). A user can execute some query through that UI and after searching the
database, the result is reflected back in the UI. In most of the cases we segregate the UI with the database. If
a change occurs in the database, the UI should be notified so that it can update its display according to the
change.

```bash

import java.util.ArrayList;
import java.util.List;

interface IObserver {
    void update(int i);
}

interface ISubject {

    void register(IObserver o);

    void unregister(IObserver o);

    void notifyObservers(int i);
}

class Observer1 implements IObserver {

    @Override
    public void update(int i) {
        System.out.println("Observer1: value in subject is : " + i);
    }
}

class Observer2 implements IObserver {
    
    @Override
    public void update(int i) {
        System.out.println("Observer2: value in subject is :" + i);
    }
}

class Subject implements ISubject {

    List<IObserver> observersList = new ArrayList<IObserver>();
    private int myValue;

    public int getMyValue() {
        return myValue;
    }

    public void setMyValue(int myValue) {
        this.myValue = myValue;
        notifyObservers(myValue);
    }

    @Override
    public void register(IObserver o) {
        observersList.add(o);
    }

    @Override
    public void unregister(IObserver o) {
        observersList.remove(o);
    }

    @Override
    public void notifyObservers(int updatedValue) {
        for (int i = 0; i < observersList.size(); i++) {
            observersList.get(i).update(updatedValue);
        }
    }
}

class ObserverPatternOneToMany {

    public static void main(String[] args) {

        Subject sub = new Subject();
        Observer1 ob1 = new Observer1();
        Observer2 ob2 = new Observer2();

        sub.register(ob1);
        sub.register(ob2);

        sub.setMyValue(5);

        sub.setMyValue(25);

        sub.unregister(ob1); // observer wont receive the next value

        sub.setMyValue(100);
    }
}

```

