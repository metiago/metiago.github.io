---
title: 'Spring Cache'
date: "2014-07-03"
draft: false
---

### Eh Cache

```java
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.ehcache.EhCacheCacheManager;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new EhCacheCacheManager(ehCacheCacheManager().getObject());
    }

    @Bean
    public EhCacheManagerFactoryBean ehCacheCacheManager() {
        EhCacheManagerFactoryBean cmfb = new EhCacheManagerFactoryBean();
        cmfb.setConfigLocation(new ClassPathResource("ehcache.xml"));
        cmfb.setShared(true);
        return cmfb;
    }
}
```


### Redis

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

@Configuration
public class RedisConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        LettuceConnectionFactory factory = new LettuceConnectionFactory();
        
        // Configure Redis server properties
        factory.setHostName("localhost"); // Redis server host
        factory.setPort(6379); // Redis server port
        
        // You can also set other properties like password, timeout, etc. if needed
        
        factory.afterPropertiesSet(); // Initialize the factory
        
        return factory;
    }
}
```

### Examples 

```java
@Cacheable(
cacheNames="pricing",
unless = "#result == null or #result.size() == 0 or #result.![badPricing] or #result[0].offeringType.name() == 'EXTERNAL' or #queryParams.containsValue('auttar_distribuidor')"
)
```

Let's break down the provided unless condition:

```bash
# This part ensures that caching doesn't occur if the result is either null or an empty collection.
1. #result == null or #result.size() == 0: 

# This part checks if the "badPricing" property of the result object is not empty. If it's not empty, caching won't occur.
2. #result.![badPricing]

# This part checks if the name of the offeringType property of the first element in the result object is 'EXTERNAL'. If it is, caching won't occur.
3. #result[0].offeringType.name() == 'EXTERNAL' 

# This part checks if the queryParams contain the value 'quak'. If they do, caching won't occur.
4. #queryParams.containsValue('quak') 
```