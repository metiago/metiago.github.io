+++

title = 'Completable Futures'
date = 1500-01-05T19:18:41-03:00

draft = false

+++

```java
public void fetchAllIssuesFromJira(List<FixVersion> fixes) throws CustomException {

    // This executor is suitable for applications that launch many short-lived tasks.
    ExecutorService executor = Executors.newCachedThreadPool();

    List<CompletableFuture> futures = new ArrayList<>();
    List<FixVersionPojo> successIssues = new ArrayList<>();
    StringBuffer errorIssues = new StringBuffer();

    for (FixVersion fx : fixes) {

        CompletableFuture<Void> asyncResul = CompletableFuture.runAsync(() -> {

            try {
                // HEAVY I.O FROM JIRA REST API
                List<FixVersionPojo> issues = fetchById(fx.getId());
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
