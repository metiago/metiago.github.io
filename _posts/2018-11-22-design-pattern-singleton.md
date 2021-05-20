---
layout: post
title:  Java Design Pattern - Singleton
date:   2018-11-22 20:18:00 +0100
category: Dev
tags: algorithm datastructure design
---

#### Concept

A particular class should have only one instance. We will use only that instance whenever we are in need.

#### Example

In a software system sometimes we may decide to use only one file system. Usually we may use it for the
centralized management of resources.

```java
class DB {
    
    private static DB _captain;

    // We make the constructor private to prevent the use of "new"
    private DB() {
    }

    public static DB getCaptain() {

        // Lazy initialization
        if (_captain == null) {
            _captain = new DB();
             
        }

        return _captain;

    }
}

class SingletonPatternEx {
    public static void main(String[] args) {
        
        DB c1 = DB.getCaptain();
            
        DB c2 = DB.getCaptain();
        if (c1 == c2) {
            System.out.println("c1 and c2 are same instance");
        }
    }
}
```

