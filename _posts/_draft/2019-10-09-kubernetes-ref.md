---
layout: default
title:  Kubernetes References
date:   2019-10-09 20:18:00 +0100
category: Dev
---

## Kubernetes References

Below there are some commands as references when using Kubernetes.


```bash
# check k8 long version
kubectl version -o json

# check k8 short version
kubectl version --short

# get cluster's nodes
kubectl get nodes

# apply configuration on a service type
kubectl apply -f services.yaml

# tail log
kubectl logs -f -l app=my_app

# limit log tail
kubectl logs my-pod --tail=10

# get services
kubectl get svc
```

