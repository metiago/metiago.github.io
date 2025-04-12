---
title: ' MySQL Quick Reference'
date: "2014-07-03"
draft: false
---

#### AES Aalgorithm

MySQL AES_ENCRYPT() function encrypts a string using AES algorithm.

```sql
select aes_decrypt(username_encrypted, 'some_key_string') un, aes_decrypt(password_encrypted, 'some_key_string') pw from login where user_id = 1;
```

MySQL AES_DECRYPT() function decrypts an encrypted string using AES algorithm to return the original string. It returns NULL if detects invalid data.

```sql
SELECT AES_DECRYPT(username_encrypted, 'some_key_string') from login;
```

#### MySQL JSON Data Type

MySQL supports the native JSON data type since version 5.7.8. The native JSON data type allows you to store JSON documents more efficiently than the JSON text format in the previous versions.

```sql
    CREATE TABLE events( 
    id int auto_increment primary key, 
    event_name varchar(255), 
    visitor varchar(255), 
    properties json, 
    browser json
    );
```

```sql
INSERT INTO events(event_name, visitor,properties, browser) VALUES (
  'pageview', 
   '1',
   '{ "page": "/" }',
   '{ "name": "Safari", "os": "Mac", "resolution": { "x": 1920, "y": 1080 } }'
),
('pageview', 
  '2',
  '{ "page": "/contact" }',
  '{ "name": "Firefox", "os": "Windows", "resolution": { "x": 2560, "y": 1600 } }'
),
(
  'pageview', 
  '1',
  '{ "page": "/products" }',
  '{ "name": "Safari", "os": "Mac", "resolution": { "x": 1920, "y": 1080 } }'
),
(
  'purchase', 
   '3',
  '{ "amount": 200 }',
  '{ "name": "Firefox", "os": "Windows", "resolution": { "x": 1600, "y": 900 } }'
),
(
  'purchase', 
   '4',
  '{ "amount": 150 }',
  '{ "name": "Firefox", "os": "Windows", "resolution": { "x": 1280, "y": 800 } }'
),
(
  'purchase', 
  '4',
  '{ "amount": 500 }',
  '{ "name": "Chrome", "os": "Windows", "resolution": { "x": 1680, "y": 1050 } }'
);
```

```sql
SELECT id, browser->'$.name' browser FROM events;

-- remove quote marks
SELECT id, browser->>'$.name' browser FROM events;

-- get the browser usage
SELECT browser->>'$.name' browser, count(browser) FROM events GROUP BY browser->>'$.name';

-- calculate the total revenue by the visitor
SELECT visitor, SUM(properties->>'$.amount') revenue
FROM events
WHERE properties->>'$.amount' > 0
GROUP BY visitor;

-- contains
SELECT *, JSON_CONTAINS(properties, '1' , '$.id') as pid, events->'$.name' as name from events;

SELECT JSON_EXTRACT( properties , '$[1]' ) from events;

SELECT JSON_EXTRACT( properties , '$[*].session_id' ) from events;

SELECT JSON_EXTRACT( properties , '$[1].*' ) from events;
```
