```java
ForkJoinPool customThreadPool = new ForkJoinPool(8);
customThreadPool.submit(() -> offeringsRequest.parallelStream() .forEach(offering -> {
processPrecification(offering, finalRequestId, queryParams, mapHeaders);
}).get();

```