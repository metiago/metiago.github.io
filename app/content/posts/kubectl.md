---
title: 'Enhancing Your Kubernetes Workflow: A Comprehensive Kubectl Quick Reference'
date: "2019-05-18"
draft: false

---

## Enhancing Your Kubernetes Workflow: A Comprehensive Kubectl Quick Reference

In the fast-evolving world of container orchestration, Kubernetes has emerged as a powerful platform for managing containerized applications. 
Understanding how to efficiently use **kubectl**, the command-line tool for interacting with Kubernetes, is crucial for developers and system administrators alike. This quick reference guide offers a handy collection of essential **kubectl** commands to streamline your Kubernetes operations.

---

### Basic Context Management

```bash
# Get contexts
kubectl config get-contexts

# Set context
kubectl config set-context my-cluster --cluster=arn:aws:eks:us-east-2:XXX:cluster/my-cluster --namespace=development --user=arn:aws:eks:us-east-2:XXX:cluster/my-cluster

# Unset context
kubectl config unset contexts.my-cluster

# Use context
kubectl config use-context my-cluster
```

### Common Operations with Namespaces
```bash
# List all namespaces
kubectl get namespaces

# Create a new namespace
kubectl create namespace my-namespace

# Delete a namespace
kubectl delete namespace my-namespace

# Use a specific namespace
kubectl config set-context --current --namespace=my-namespace
```

### Working with Pods

```bash
# List all pods
kubectl get pods

# Delete a pod
kubectl delete pod <name>

# Get pod IP
kubectl get pods my-pod -o jsonpath --template={.status.podIP}

# List pod details
kubectl describe pod my-pod

# Get pod logs
kubectl logs my-pod

# Execute a command in a running container
kubectl exec -it <pod-name> -- bash

# Attach to a container
kubectl attach -it my-pod

# Copy file from/to
kubectl cp <pod-name>:</path/to/remote/file> </path/to/local/file>
```

### Managing Services

```bash
# List all services
kubectl get services

# List service details
kubectl describe service my-service
```

### Resource Management

```bash
# Create or update a resource object
kubectl apply -f obj.yaml

# View last applied object
kubectl apply -f myobj.yaml view-last-applied

# Delete resource object
kubectl delete <resource-name> <obj-name>

# Clean up cluster
kubectl delete deployments --all
```

### ConfigMap Management

```bash
# Create a ConfigMap
kubectl create configmap my-map --from-literal=greeter.prefix="Hello"

# Show ConfigMap in YAML format
kubectl get configmap spring-boot-configmaps-demo -o yaml
```

### Handling Secrets

```bash
# Create a secret
kubectl create secret generic spring-security \
--from-literal=spring.user.name=demo \
--from-literal=spring.user.password=password

# List secret in YAML format
kubectl get secret spring-security -o yaml
```

---

This enhanced reference serves as a valuable tool for anyone working with Kubernetes, providing quick access to commands that can simplify everyday tasks. Familiarizing yourself with these commands will help you effectively manage your Kubernetes clusters and applications, making your development workflow smoother and more efficient.