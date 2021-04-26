---
layout: post
title:  Java - AspectJ
date:   2019-05-20 20:18:00 +0100
category: Dev
tags: java aspectj
---

#### Introduction

AspectJ is a [Java library](https://www.eclipse.org/aspectj/) where developers can write code on a paradigm called Aspect-oriented programming (AOP).

Basically saying, we can add a behaviour before, at, or after a method calling without modifying the code itself. Here on [Wikipedia](https://en.wikipedia.org/wiki/Aspect-oriented_programming) you can find a complete explanation about AOP.


#### Example


First we need to add `aspectjrt` dependency to our pom.xml.

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

First will create a custom annotation to annotate the methods we want to intercept.

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

Below is our AspectJ implementation which 

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