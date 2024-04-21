---
title: 'Spring Cache'
date: 2019-04-10T13:57:24-03:00
draft: false
---

```java
@Cacheable(
cacheNames="pricing",
unless = "#result == null or #result.size() == 0 or #result.![badPricing] or #result[0].offeringType.name() == 'EXTERNAL' or #queryParams.containsValue('auttar_distribuidor')"
)
```

Let's break down the provided unless condition:

1. #result == null or #result.size() == 0: This part ensures that caching doesn't occur if the result is either null or an empty collection.
1. #result.![badPricing]: This part checks if the "badPricing" property of the result object is not empty. If it's not empty, caching won't occur.
1. #result[0].offeringType.name() == 'EXTERNAL': This part checks if the name of the offeringType property of the first element in the result object is 'EXTERNAL'. If it is, caching won't occur.
1. #queryParams.containsValue('auttar_distribuidor'): This part checks if the queryParams contain the value 'auttar_distribuidor'. If they do, caching won't occur.