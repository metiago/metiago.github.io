---
title:  'PostgreSQL'
date: 2017-02-09T19:18:41-03:00
draft: false
---

```yml
version: '3.6'

services:
  adminer_container:
    image: adminer:latest
    environment:
      ADMINER_DEFAULT_SERVER: db
      ADMINER_DESIGN: dracula
    ports:
      - 8080:8080
  db:
    image: postgres:10.1-alpine
    ports:
      - 5432:5432
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_PASSWORD=12345678
      - POSTGRES_USER=postgres
  elasticsearch:
    image: elasticsearch:7.17.0
    ports:
      - 9200:9200
    environment:
      - discovery.type=single-node
volumes:
  postgres_data:
```