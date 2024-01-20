+++
title =  'MongoDB Quick References'
date = 2017-04-13T19:18:41-03:00
draft = false
+++

#### MongoDB Seed

Set up MongoDB database with some data for development purposes.

`Dockefile`

```bash
FROM python:3.7.2-alpine3.8
RUN pip install --ignore-installed "pymongo==3.7.2" "Faker==1.0.2"
COPY seed.py /
CMD python3 /seed.py
```

`docker-compose.yaml`

```yaml
version: '3'
services:
  mongo:
    image: "mongo:4.0.2"
    ports:
      - "27017:27017"
    command: --profile=1 --slowms=0
  mongo-seeding:
    build: ./
    depends_on:
      - mongo
  mongo-express:
    image: "mongo-express:0.49.0"
    ports:
      - "8081:8081"
    depends_on:
      - mongo
```

`seed.py`

```python
#!/usr/bin/env python3
import random
from datetime import datetime, timedelta

from bson import ObjectId
from faker import Faker
from pymongo import MongoClient

faker = Faker("en")

def seed():
    print("Start seeding...")
    client = MongoClient('mongodb://mongo:27017/test')
    db = client.test
    new_products = [generate_product() for _ in range(500)]
    db.products.delete_many({})
    db.products.insert_many(new_products)
    print("Finished seeding.")


def generate_product():
    return {
        "_id": ObjectId(),
        "name": faker.company(),
        "amount": random.randrange(100),
        "isActive": faker.boolean(chance_of_getting_true=80),
        "dateCreated": faker.date_time_between(start_date="-10y", end_date="now"),
        "tags": [faker.word(), faker.word()]
    }


if __name__ == '__main__':
    seed()
```

#### MongoDB Backup

The mongodump command will create a backup / dump of the MongoDB database with the name specified by the --db [DB NAME] argument.

The --out /home/db/backups/`date +"%Y%m%d" argument specifies the output directory as /home/db/backups/[TODAY'S DATE] 
e.g. /home/db/backups/20190903.

```java
sudo mongodump --db [DB NAME] --out /var/backups/`date +"%Y%m%d"`
```

#### MongoDB Restore

The mongorestore command restores a database to the destination --db [DB NAME] from the specified directory, e.g. /home/db/backups/20190903.

```java
sudo mongorestore --db [DB NAME] /home/db/backups/[BACKUP FOLDER NAME]
```
