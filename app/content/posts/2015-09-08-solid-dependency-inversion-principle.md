---
title: 'Dependency Inversion Principle'
date: "2015-09-08"
draft: false
image: "https://placehold.co/600x400"
---

The principle defines two main points:

1. High-level modules should not depend on low-level modules. Both should depend on abstractions.
2. Abstractions should not depend on details. Details should depend on abstractions.


### Example

`ReportService.java`

```java
public class ReportService {

    void print() {
        System.out.println("Printing...");
    }
}
```

`ReportClient.java`

```java
public class ReportClient {

    void call() {
        ReportService reportService = new ReportService();
        reportService.print();
    }
}
```

`Main.java`

```java
public class Main {

    public static void main(String[] args) {
        ReportClient reportClient = new ReportClient();
        reportClient.call();
    }
}
```

On this example `ReportClient` is our high-level module and it depends on low-level modules, in this case `ReportService`.

The `Dependency Inversion Principle` can be achieved refactoring our code having in mind the term "programming against interfaces"


`ReportInterface.java`

```java
public interface ReportInterface {

    void print();
}
```

`ReportService.java`

```java
public class ReportService implements ReportInterface{


    @Override
    public void print() {
        System.out.println("Printing...");
    }
}
```

`ReportClient.java`

```java
public class ReportClient {

    private ReportInterface reportInterface;

    public ReportClient(ReportInterface reportInterface) {
        this.reportInterface = reportInterface;
    }

    void call() {
        this.reportInterface.print();
    }
}
```

```java
public class Main {

    public static void main(String[] args) {
        ReportClient reportClient = new ReportClient(new ReportService());
        reportClient.call();
    }
}
```

As you can see, our `ReportClient` class now depends on the abstraction class, in this case, our interface, doing so, we can achieve
our design pattern `Dependency Inversion` as well as allow us to see  the power of polymorphism :).
