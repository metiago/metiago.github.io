---
title: 'Kubernetes Service Discovery (DNS)'
date: "2014-07-03"
draft: false
---

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data():
    data = {'message': 'Hello from the backend service!'}
    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

```yml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          
          ports:
            - containerPort: 8080
```

```python
import requests

backend_url = "http://backend-service:80/api/data"
response = requests.get(backend_url)
```

```yml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          
          ports:
            - containerPort: 8080
```

```yml
# frontend-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: example.com  # Replace with your domain name
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

```bash
kubectl apply -f backend-service.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-ingress.yaml
```