---
title: 'Single Responsibility Principle'
date: "2015-10-08"
draft: false

---

The `Single Responsibility Principle` says that a object should handle only one thing well.  

This UserService class is doing 3 different things, therefore it's breaking this pattern.

```java
public class UserService {

    public void generateReport() {
        // logic
    }

    public void calculateBill() {
        // logic
    }

    public void login() {
      // logic
    }
}
```

To fix that, basically we split that out in classes that handle exactly a single method. 

```java
public class AuthService {

  public void login(User user) {
    // logic
  }
}
```

```java
public class BillGenerator {

  public void printBill(User user) {
    // logic
  }
}
```

```java
public class ReportGenerator {

  public void printReport(User user) {
    // logic
  }
}
``` 

```java
public class UserService {

  public UserService() {
      // INSTANTIATE THE SERVICES ABOVE AND USE IT WHEN NECESSARY
  }

}
```
