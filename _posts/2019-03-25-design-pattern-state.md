---
layout: default
title:  Java Design Pattern - State
date:   2019-03-25 20:18:00 +0100
category: Dev
---

## State Design Pattern


#### Concept

Allow an object to alter its behavior when its internal state changes. The object will appear to change its class.

#### Example

We have a job processing application where we can process only one job (or any certain number of jobs) at a time. Now
if a new job appears, either the application will process that job or it will signal that the new job cannot be
processed at this moment because the system is already processing the maximum number of jobs in it
(i.e., its number of job processing capabilities has reached the ceiling).


```java
abstract class RemoteControl {
    public abstract void pressSwitch(TV context);
}
```

```java
public class Off extends RemoteControl {

    @Override
    public void pressSwitch(TV context) {
        System.out.println("I am Off. Going to be On now");
        context.setState(new On());
    }
}
```

```java
public class On extends RemoteControl {

    @Override
    public void pressSwitch(TV context) {
        System.out.println("I am Off. Going to be On now");
        context.setState(new On());
    }
}
```

```java
public class TV {

    private RemoteControl state;

    public TV(RemoteControl state) {
        this.state = state;
    }

    public RemoteControl getState() {
        return state;
    }

    public void setState(RemoteControl state) {
        this.state = state;
    }

    public void pressButton() {
        state.pressSwitch(this);
    }

}

```

```java
public class Demo {

    public static void main(String[] args) {
        Off initialState = new Off();
        TV tv = new TV(initialState);
        tv.pressButton();
        tv.pressButton();
    }
}
```