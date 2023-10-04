+++

title =  'Docker Quick References'
date = 1500-02-09T19:18:41-03:00

draft = false

+++

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

```bash
#!/bin/sh

read -p '
1: MYSQL
2: KAFKA
3: P
4: Q
' option

clear

# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers with status = exited
docker rm $(docker ps -q -f status=exited)

# Clean up dangling images
docker rmi $(docker images -f "dangling=true" -q)

# Remove all containers no longer running
docker rm $(docker ps -a -q)

# Remove all images + Remove unused data
#sudo docker rmi -f $(docker images)
#docker system prune -a

if [ $option -eq 1 ]; then
 docker-compose -f docker-compose.mysql.yml up -d

elif [ $option -eq 2 ]; then
 docker-compose -f docker-compose.kafka.yml up -d

elif [ $option -eq 3 ]; then
 echo '*** to implement ****'

elif [ $option -eq 4 ]; then
 echo '*** to implement ****'
fi
```

### Kafka

```yaml
version: '3'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.1
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000


  broker:
    image: confluentinc/cp-kafka:7.0.1
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

### MySQL
```yaml
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

### Postgres
```yaml
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
volumes:
  postgres_data:
```

### RabbitMQ & MongoDB
```yaml
version: '3.2'
services:
  mongo:
    image: "mongo:4.0.2"
    restart: always
    ports:
      - "27017:27017"
    command: --profile=1 --slowms=0
    networks:
      - quant_net


  mongo-express:
    image: "mongo-express:0.54"
    restart: always
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: admin
    depends_on:
      - mongo
    networks:
      - quant_net


  rabbitmq:
    image: rabbitmq:3-management-alpine
    restart: always
    container_name: 'rabbitmq'
    ports:
      - 5672:5672
      - 15672:15672
    networks:
      - quant_net


networks:
  quant_net:
    driver: bridge
```

### Redis & Redis UI & RabbitMQ

```yaml
version: '3.8'
services:


  redis:
      container_name: redis
      image: redis:6.2-alpine
      restart: always
      ports:
        - '6379:6379'
      command: ["redis-server", "--appendonly", "yes"]
      networks:
        - south_net


  redis-commander:
    image: rediscommander/redis-commander:latest
    environment:
      - REDIS_HOSTS=local:redis:6379
      - HTTP_USER=root
      - HTTP_PASSWORD=qwerty
    ports:
      - 8081:8081
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

### Apache Cassandra & Postgres

```yaml
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
  cassandra:
    image: cassandra:3.11.14
    ports:
      - 9042:9042
      - 9160:9160
    volumes:
        - ./docker/cassandra:/var/lib/cassandra
    environment:
        - CASSANDRA_CLUSTER_NAME=local-cluster
volumes:
  postgres_data:
```