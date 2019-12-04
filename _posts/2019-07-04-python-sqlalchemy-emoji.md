---
layout: default
title:  Flask Framework - Emojis in SQLAlchemy
date:   2019-07-04 20:18:00 +0100
category: Dev
---

## Flask Framework - Emojis in SQLAlchemy

Today, I'm going to share a possibly useful solution to persist unicode string in MySQL using SQLAlchemy ORM.


## Example

In order to persist unicode string inside MySQL database, we need to register a SQLAlchemy event listener during the connection phase.
Basically it will change the database table collate to `UTF8MB4` and adapt the cursor to save unicode data.

You can declare the snipeet below in your models or in helper class.

```python
from sqlalchemy import event
from sqlalchemy.pool import Pool


@event.listens_for(Pool, "connect")
def set_unicode(dbapi_conn, conn_record):
    cursor = dbapi_conn.cursor()
    try:
        cursor.execute("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'")
    except Exception as e:
        raise e
```