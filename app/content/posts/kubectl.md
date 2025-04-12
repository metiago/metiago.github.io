---
title: 'K8S Kubectl Quick Reference'
date: "2019-05-18"
draft: false
image: "https://placehold.co/600x400"
---

```bash
# get contexts
kubectl config get-contexts

# set context
kubectl config set-context my-cluster --cluster=arn:aws:eks:us-east-2:XXX:cluster/my-cluster --namespace=development --user=arn:aws:eks:us-east-2:XXX:cluster/my-cluster

# UNSET CONTEXT
kubectl config unset contexts.my-cluster

# USE CONTEXT
kubectl config use-context my-cluster

# LIST ALL PODS
kubectl get pods

# DELETE POD
kubectl delete pod <name>

# GET POD IP
kubectl get pods my-pod -o jsonpath --template={.status.podIP}

# LIST POD DETAILS
kubectl describe pod my-pod

# LIST ALL SERVICES
kubectl get services

# LIST SERVICE DETAILS
kubectl describe service my-service

# CREATE OR UPDATE A RESOURCE OBJECT
kubectl apply -f obj.yaml

# VIEW LAST APPLIED OBJECT
kubectl apply -f myobj.yaml view-last-applied

# DELETE RESOURE OBJECT
kubectl delete <resource-name> <obj-name>

# GET POD LOGS
kubectl logs my-pod

# EXECUTE A COMMAND IN A RUNNING CONTAINER
kubectl exec -it <pod-name> -- bash

# ATTACH INTO A CONTAINER
kubectl attach -it my-pod

# COPY FILE FROM / TO
kubectl cp <pod-name>:</path/to/remote/file> </path/to/local/file>

# Clean up cluster
kubectl delete deployments --all

# Access container
kubectl exec --stdin --tty my-pod -- /bin/bash
```

#### Config Map

```bash
# create
kubectl create configmap my-map --from-literal=greeter.prefix="Hello"

# show yaml file
kubectl get configmap spring-boot-configmaps-demo -o yaml
```

### Secrets
```bash
# create
kubectl create secret generic spring-security \
--from-literal=spring.user.name=demo \
--from-literal=spring.user.password=password

# list yaml format
kubectl get secret spring-security -o yaml
```
