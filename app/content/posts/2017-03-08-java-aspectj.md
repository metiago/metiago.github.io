---
title:  'Aspect Oriented Programming'
date: "2017-03-08"
draft: false

---

AspectJ is a Java library that implements aspect-oriented programming. Aspect-Oriented Programming (AOP) is a programming paradigm that allows the separation of cross-cutting concerns (e.g. logging, security, or error handling) from the main business logic. It achieves this by defining *aspects* that can be applied to different parts of a program.

**Benefits of AOP:**
1. **Improved modularity:** Cross-cutting concerns are isolated into separate aspects.
2. **Reusability:** Aspects can be reused across different parts of the application.
3. **Easier maintenance:** Changes to concerns like logging or security can be made in one place rather than throughout the codebase.

#### Example

`pom.xml`

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjrt</artifactId>
            <version>1.8.2</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

A crosscutting annotation is typically used in AOP to define behaviors that apply across multiple parts of a program.

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;


@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface YourAnnotation {
}
```

```java
public class YourClass {

    public static void main(String[] args) {
        YourClass yourClass = new YourClass();
        yourClass.yourMethodAround();
    }

    @YourAnnotation
    public void yourMethodAround(){
        System.out.println("Executing TestTarget.yourMethodAround()");
    }
}
```

#### Core Implementation

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.JoinPoint;

@Aspect
public class YourAspect {

    // Defines a pointcut that we can use in the @Before, @After, @AfterThrowing, @AfterReturning, @Around specifications
    // The pointcut will look for the @YourAnnotation
    @Pointcut("@annotation(YourAnnotation)")
    public void annotationPointCutDefinition(){
    }

    //Defines a pointcut that we can use in the @Before,@After, @AfterThrowing, @AfterReturning,@Around specifications
    //The pointcut is a catch-all pointcut with the scope of execution
    @Pointcut("execution(* *(..))")
    public void atExecution(){}

    //Defines a pointcut where the @YourAnnotation exists
    //and combines that with a catch-all pointcut with the scope of execution
    @Around("@annotation(YourAnnotation) && execution(* *(..))")

    //ProceedingJointPoint = the reference of the call to the method.
    //The difference between ProceedingJointPoint and JointPoint is that a JointPoint can't be continued (proceeded)
    //A ProceedingJointPoint can be continued (proceeded) and is needed for an Around advice
    public Object aroundAdvice(ProceedingJoinPoint joinPoint) throws Throwable {
        // Default Object that we can use to return to the consumer
        Object returnObject = null;
        try {
            System.out.println("YourAspect's aroundAdvice's body is now executed Before yourMethodAround is called.");
            // We choose to continue the call to the method in question
            returnObject = joinPoint.proceed();
            // If no exception is thrown we should land here and we can modify the returnObject, if we want to.
        } catch (Throwable throwable) {
            // Here we can catch and modify any exceptions that are called
            // We could potentially not throw the exception to the caller and instead return "null" or a default object.
            throw throwable;
        }
        finally {
            //If we want to be sure that some of our code is executed even if we get an exception
            System.out.println("YourAspect's aroundAdvice's body is now executed After yourMethodAround is called.");
        }
        return returnObject;
    }

    @After("annotationPointCutDefinition() && atExecution()")
    // JointPoint = the reference of the call to the method
    public void printNewLine(JoinPoint pointcut){
        //Just prints new lines after each method that's executed in
        System.out.print("\n\r");
    }
}
```

### Code Breakdown:

#### 1. **@Aspect Annotation**
```java
@Aspect
public class YourAspect {
    // Aspect code
}
```
- **@Aspect**: This marks the class as an aspect. It tells AspectJ to treat this class as one that contains cross-cutting concerns (aspects).
  
#### 2. **@Pointcut Definitions**
```java
@Pointcut("@annotation(YourAnnotation)")
public void annotationPointCutDefinition() { }
```
- **@Pointcut("@annotation(YourAnnotation)")**: This defines a pointcut expression that matches methods annotated with `@YourAnnotation`. 
  - This pointcut is used to target methods that have `@YourAnnotation` applied to them, so it can be used in the `@Around` or `@After` advice to specify where to apply the behavior.

```java
@Pointcut("execution(* *(..))")
public void atExecution() { }
```
- **@Pointcut("execution(* *(..))")**: This defines a second pointcut that matches all method executions. The expression `execution(* *(..))` targets any method, regardless of its return type or arguments.
  - `*` means "any return type."
  - `*` (inside the parentheses) means "any method name."
  - `(..)` means "any number of arguments."

These pointcuts are used to select specific join points (places in the code where the advice will apply).

#### 3. **@Around Advice**
```java
@Around("@annotation(YourAnnotation) && execution(* *(..))")
public Object aroundAdvice(ProceedingJoinPoint joinPoint) throws Throwable {
    // Advice body
}
```
- **@Around("@annotation(YourAnnotation) && execution(* *(..))")**: This defines an **around advice** that applies to any method annotated with `@YourAnnotation` and executed at any join point. The `&&` operator combines the two pointcuts, so the advice will only apply if both conditions are true:
  - The method must be annotated with `@YourAnnotation`.
  - The method must match the execution pointcut (i.e., any method).
  
- **ProceedingJoinPoint**: This is a special type of `JoinPoint` that allows you to control the execution of the method. By calling `joinPoint.proceed()`, the target method is invoked. You can execute code before, around, and after the method call within the `aroundAdvice` method.

- Inside the `aroundAdvice`:
  - **Before Execution**: `System.out.println("YourAspect's aroundAdvice's body is now executed Before yourMethodAround is called.");` — This message is printed before the actual method execution.
  - **Proceed Method**: `returnObject = joinPoint.proceed();` — This line invokes the actual method. The result of the method (its return value) is stored in `returnObject`.
  - **After Execution**: `System.out.println("YourAspect's aroundAdvice's body is now executed After yourMethodAround is called.");` — This message is printed after the method execution.
  
- **Exception Handling**: The `catch` block rethrows any `Throwable` exceptions that might occur during the method execution. This ensures the exception is propagated after the advice is done.
  
#### 4. **@After Advice**
```java
@After("annotationPointCutDefinition() && atExecution()")
public void printNewLine(JoinPoint pointcut) {
    System.out.print("\n\r");
}
```
- **@After("annotationPointCutDefinition() && atExecution()")**: This defines an **after advice** that runs after the method completes. It applies when both of these conditions are true:
  - The method is annotated with `@YourAnnotation` (from the `annotationPointCutDefinition` pointcut).
  - The method execution matches the `atExecution()` pointcut (which targets all method executions).
  
- **printNewLine**: This method prints a new line (`\n\r`) after the annotated method finishes. The `JoinPoint` parameter allows you to access details of the join point (the method invocation), but in this case, it's not being used in the body of the method.
