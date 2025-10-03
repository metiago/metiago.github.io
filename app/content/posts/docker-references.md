---
title: 'Docker - Quick Reference'
date: "2018-03-23"
draft: false

---

#### Basic Commands

```bash

# Show log after 30 sec.
docker logs --since 30s -f <container_name_or_id>

# Show last 20 lines of the log file
docker logs --tail 20 -f <image_id>

# Build a new image, it should be executed in the same folder which contains your custom Dockerfile
docker build --rm --no-cache -t gitlab-vm .

# Running a container in background
docker run -p 8080:3000 -d nginx

# Enter in a running container
docker exec -it <container_id> /bin/bash

# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers with status = exited
docker rm $(docker ps -q -f status=exited)

# Clean up dangling images
docker rmi $(docker images -f "dangling=true" -q)

# Remove all containers no longer running
docker rm $(docker ps -a -q)

# Remove all images + Remove unused data
sudo docker rmi -f $(docker images)
docker system prune -a

# Commit a custom image
docker commit <container_id> <your_custom_image_name>

# Tag a container image
docker tag <image_id> <repository_name>

# Push an image to Docker Hub
docker push <repository_name> ex. myusername/jenkins

# List running containers
docker ps

# Check container information
docker inspect <container_id>

# Link containers
docker run --name gogs --link mysql:mysql -p 8080:3000 -d gogs

# Test listening port inside container
cat < /dev/tcp/127.0.0.1/22
```

#### Kafka

```yaml
version: '3'
services:
  zookeeper:
    
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  broker:
    
    container_name: broker
    ports:
    # To learn about configuring Kafka for access across networks see
    # https://www.confluent.io/blog/kafka-client-cannot-connect-to-broker-on-aws-on-docker-etc/
      - "9092:9092"
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,PLAINTEXT_INTERNAL://broker:29092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
```

#### MySQL

```yml
version: '3.6'

services:
  adminer_container:
    
    environment:
      ADMINER_DEFAULT_SERVER: db
      ADMINER_DESIGN: dracula
    ports:
      - 8080:8080
  db:
    container_name: mysql8
    
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

#### RabbitMQ

```yml
version: '3.8'
services:

  mongo:
    
    restart: always
    ports:
      - "27017:27017"
    command: --profile=1 --slowms=0
    networks:
      - south_net

  mongo-express:
    
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
      
      restart: always
      ports:
        - '6379:6379'
      command: ["redis-server", "--appendonly", "yes"]
      networks:
        - south_net

  activemq:
    
    restart: always
    ports:
      - "61616:61616"
    networks:
      - south_net

  redis-commander:
    
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

#### PostgreSQL

```yml
version: '3.6'

services:
  adminer_container:
    
    environment:
      ADMINER_DEFAULT_SERVER: db
      ADMINER_DESIGN: dracula
    ports:
      - 8080:8080
  db:
    
    ports:
      - 5432:5432
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_PASSWORD=12345678
      - POSTGRES_USER=postgres
  elasticsearch:
    
    ports:
      - 9200:9200
    environment:
      - discovery.type=single-node
volumes:
  postgres_data:
```