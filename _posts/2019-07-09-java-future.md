---
layout: post
title:  Java - Completable Futures
date:   2019-07-09 20:18:00 +0100
category: Dev
tags: algorithm datastructure java
---

A CompltableFuture is used for asynchronous programming. Asynchronous programming means writing non-blocking code. It runs a task on a separate thread than the main application thread and notifies the main thread about its progress, completion or failure. A CompletableFuture is an extension to Java's Future API which was introduced in Java 8.

#### Examples

This snipet below demonstrate a previous implementation that I did when working at TOTVS.
I had a list of issues fetched from the database and for each one I had to query JIRA API which is a slow operation, 
using an multiple threads.

```java
public void findAllIssuesFromJira(List<FixVersion> fixes) throws CustomException {

    // This executor is suitable for applications that launch many short-lived tasks.
    ExecutorService executor = Executors.newCachedThreadPool();

    List<CompletableFuture> futures = new ArrayList<>();
    List<FixVersionPojo> successIssues = new ArrayList<>();
    StringBuffer errorIssues = new StringBuffer();

    for (FixVersion fx : fixes) {

        CompletableFuture<Void> asyncResul = CompletableFuture.runAsync(() -> {

            try {
                List<FixVersionPojo> issues = findAllIssues(fx.getId());
                successIssues.addAll(issues);
            } catch (CustomException e) {
                LOGGER.info(String.format("Failed to get data %s", fx.getDsFxv()));
                errorIssues.append("( " + fx.getVersion() + " )");
            }

        }, executor);

        futures.add(asyncResul);
    }

    CompletableFuture.allOf(futures.toArray(new CompletableFuture[futures.size()]))
            .thenApply(s -> send(successIssues, errorIssues))
            .thenAccept(this::complete);
}
```