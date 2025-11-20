---
title: ' MySQL JSON'
date: "2014-07-03"
draft: false
---

### MySQL JSON Data Type

MySQL natively supports the JSON data type starting from version 5.7.8, enabling efficient storage and manipulation of JSON documents. This feature allows for better performance and usability compared to storing JSON as plain text.

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

### 1. Select Browsers by Name

To select the name of the browser used in each event:

```sql
SELECT id, JSON_UNQUOTE(browser->'$.name') AS browser 
FROM events;
```

### 2. Select Browser Name Using `->>`

Using the shorthand for quick access to string values:

```sql
SELECT id, JSON_UNQUOTE(browser->>'$.name') AS browser 
FROM events;
```

### 3. Count Events Grouped by Browser Name

To count the number of events and group them by browser name:

```sql
SELECT 
    JSON_UNQUOTE(browser->>'$.name') AS browser, 
    COUNT(*) AS event_count 
FROM events 
GROUP BY browser->>'$.name';
```

### 4. Calculate Total Revenue by Visitor

To sum the amount from the `properties` JSON for visitors who have made a purchase:

```sql
SELECT 
    visitor, 
    SUM(CASE WHEN properties->>'$.amount' IS NOT NULL THEN CAST(properties->>'$.amount' AS UNSIGNED) ELSE 0 END) AS revenue 
FROM events 
WHERE properties->>'$.amount' IS NOT NULL 
GROUP BY visitor;
```

### 5. Extracting JSON Properties with Conditional Check

To select all fields while verifying if a specific property exists:

```sql
SELECT *,
    JSON_CONTAINS(properties, '1', '$.id') AS pid,
    JSON_UNQUOTE(browser->>'$.name') AS name 
FROM events;
```

### 6. Extract a Single Property from JSON Array

To extract a specific JSON object in a JSON array:

```sql
SELECT JSON_EXTRACT(properties, '$.page') AS page 
FROM events;
```

### 7. Extract All Session IDs (Assuming they are present)

Given your inserts, it looks like there are no explicit `session_id` properties, but if they existed, you would extract them like:

```sql
SELECT 
    JSON_UNQUOTE(JSON_EXTRACT(properties, '$.session_id')) AS session_id 
FROM events;
```

### 8. Extract All Properties

To extract all properties for each event:

```sql
SELECT JSON_EXTRACT(properties, '$.*') AS all_properties 
FROM events;
```