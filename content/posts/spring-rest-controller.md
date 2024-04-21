---
title: 'Spring Rest Controller'
date: 2019-04-10T13:57:24-03:00
draft: false
---

#### Query Strings

In Spring Boot, @RequestParam is an annotation used to bind request parameters to method parameters in your controller handler methods. It allows you to access query parameters, form data, and parts of the URL in your Spring MVC application.

```java
@RequestMapping(value = "/filter", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<List<DatabaseServer>> findAllByFilter(@RequestParam(value = "nmSrv", required = false, defaultValue = " ") String nmSrv,
                                                            @RequestParam(value = "active", required = false) Boolean active) {
```

#### Path Params

```java
@RequestMapping(value = "/{id}", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<Void> delete(@PathVariable("id") Long id) throws Exception {
    databaseServerService.delete(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
}
```