---
layout: post
title:  Kubernetes - Kubectl Reference
date:   2019-07-09 20:18:00 +0100
tags: kubernetes cloud microservices
---

Kubernetes - Kubectl References

```bash
# LIST ALL PODS
kubectl get pods

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
```

