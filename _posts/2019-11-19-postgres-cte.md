---
layout: post
title:  PostgreSQL CTE
date:   2019-11-19 20:18:00 +0100
category: Dev
tags: postgres databases
---

Below there is a simple reference to use PostgreSQL CTE feature to fetch recursive data.


```sql

WITH RECURSIVE cte (id, text, path, parent_id, lvl)  AS (
    SELECT  id,
	text,
        array[id] AS path,
        parent_id,
        1 AS lvl
    FROM    comments
    WHERE   parent_id is null
    AND post_id=1

    UNION ALL

    SELECT  comments.id,
        comments.text,
        cte.path || comments.id,
        comments.parent_id,
        cte.lvl + 1 AS lvl
    FROM    comments
    JOIN cte ON comments.parent_id = cte.id
    )
    SELECT * FROM cte
ORDER BY path;

```

