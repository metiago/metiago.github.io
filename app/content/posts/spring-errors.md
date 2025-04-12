---
title:  'Spring Boot - Errors'
date: "2014-07-03"
draft: false
image: "https://cdn.pixabay.com/photo/2017/01/04/13/28/problem-1951987_1280.jpg"
---

This code snippet might address the "No thread-bound request found" issue that can arise when using `RequestContextHolder.currentRequestAttributes()` in asynchronous contexts. By capturing the current request attributes before launching asynchronous tasks, it ensures that these attributes are restored in the new thread via `RequestContextHolder.setRequestAttributes(requestAttributes)`. This allows you to access request-specific data, such as headers, in threads that would otherwise not have a bound request context, enabling seamless handling of request-related operations even in a multi-threaded environment.

```bash
var requestAttributes = RequestContextHolder.currentRequestAttributes();
return CompletableFuture.allOf(futureEnrichment, futureEnrichmentSubStatus).thenApplyAsync(future -> {
	RequestContextHolder.setRequestAttributes(requestAttributes);
	myService.update(1L);
}).get();
```