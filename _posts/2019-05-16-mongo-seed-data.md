---
layout: default
title:  Mongo DB Seed Data
date:   2019-05-16 20:18:00 +0100
category: Dev
---

## Mongo DB Seed Data

In this post, I'm going to write down some examples to create a `ready to go` development environment
using Docker Compose and Mongo Database

1. Create a Dockerfile with this content below
```bash
FROM python:3.7.2-alpine3.8
RUN pip install --ignore-installed "pymongo==3.7.2" "Faker==1.0.2"
COPY seedMongo.py /
CMD python3 /seedMongo.py
```

2. Create a docker-compose.yml
```bash
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

3. Create a Python file called seedMongo.py

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

4. Run `docker-compose up` to set up this environment 
