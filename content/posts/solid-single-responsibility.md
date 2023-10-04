+++

title =  'Single Responsibility Principle'
date = 1500-03-17T19:18:41-03:00

draft = false


+++

Today I'm writing about the principle called `Single Responsibility Principle` which is one of the 5 principles of `SOLID`, you can read more about it 
[here](https://metiago.github.io/2018/05/01/java-design-principles-design-patterns.html) and [here](https://en.wikipedia.org/wiki/SOLID). These patterns are really useful since it helps developers to structure their codes so that future refactoring and maintenance won't break any other part of the system as well as
make life easier when adding new features.

Below we have a Java class which contains three methods, basically we're coupling everything in only one class which doesn't have the `responsibility` to handle that.

### Example

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

The `Single Responsibility Principle` suggest us to split that out in small classes keeping everyone with its own responsibility.

We could make something like:

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
