---
title:  'Rabbit & Mongo & Redis'
date: 2017-02-09T19:18:41-03:00
draft: false
---

```yml
version: '3.8'
services:

  mongo:
    image: "mongo:4.0.2"
    restart: always
    ports:
      - "27017:27017"
    command: --profile=1 --slowms=0
    networks:
      - south_net

  mongo-express:
    image: "mongo-express:0.54"
    restart: always
    ports:
      - "9091:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: admin
    depends_on:
      - mongo
    networks:
      - south_net

  redis:
      container_name: redis
      image: redis:6.2-alpine
      restart: always
      ports:
        - '6379:6379'
      command: ["redis-server", "--appendonly", "yes"]
      networks:
        - south_net

  activemq:
    image: "rmohr/activemq:5.15.9-alpine"
    restart: always
    ports:
      - "61616:61616"
    networks:
      - south_net

  redis-commander:
    image: rediscommander/redis-commander:latest
    environment:
      - REDIS_HOSTS=local:redis:6379
      - HTTP_USER=root
      - HTTP_PASSWORD=qwerty
    ports:
      - 5000:8082
    depends_on:
      - redis
    networks:
        - south_net

  rabbitmq:
    image: rabbitmq:3-management-alpine
    restart: always
    container_name: 'rabbitmq'
    ports:
      - 5672:5672
      - 15672:15672
    networks:
      - south_net

networks:
  south_net:
    driver: bridge

```