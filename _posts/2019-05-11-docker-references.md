---
layout: post
title:  Docker References
date:   2019-05-11 20:18:00 +0100
category: Dev
tags: docker containers design
---

## Docker Command References
In this simple docker reference, I'll show you some useful commands to manage docker images for development

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