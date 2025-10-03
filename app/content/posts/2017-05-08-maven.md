---
title: 'Maven - Quick Reference'
date: "2017-05-08"
draft: false

---


```bash
# test a single method with Spring Boot test profile
mvn test -Dtest=CacheControllerTest#getAllCaches -Dspring.profiles.active=test test

# build app skipping tests
mvn clean install -DskipTests=true
```