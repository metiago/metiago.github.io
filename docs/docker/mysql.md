---
title:  'MySQL'
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
    container_name: mysql8
    image: mysql:8.0
    command: mysqld --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: test
      MYSQL_ALLOW_EMPTY_PASSWORD: "yes"
    ports:
      - '3306:3306'
    volumes:
      - './docker/db/data:/var/lib/mysql'
      - './docker/db/my.cnf:/etc/mysql/conf.d/my.cnf'
      - './docker/db/sql:/docker-entrypoint-initdb.d'
```