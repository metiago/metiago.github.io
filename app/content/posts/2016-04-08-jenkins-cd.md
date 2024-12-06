---
title: 'Jenkins Continuous Delivery'
date: "2016-04-08"
draft: false
image: "https://placehold.co/600x400"
---

Continuous delivery (CD) is fundamentally a set of practices and disciplines in which software delivery teams produce valuable and robust software in short cycles. 

This guide is about how set up a continuous delivery pipeline using `Jenkins`, `SonarQube` and `Kubernetes` deploying a docker Java app into `EKS`.

First of all, we have to setp up <a href="/devops/jenkins-ci/" target="_blank"> this </a> CI server.

After that, we should follow these steps below in order to configure the aws cli and kubectl to interact with EKS cluster.

```bash
# Login into vagrant machine
vagrant ssh

# Activate our python env
source venv/bin/activate

# Install AWS CLI
pip install awscli

# Configure AWS CLI
aws configure

# Update kube config
aws eks --region <region-code> update-kubeconfig --name <cluster_name>

# Add permision for jenkins user
sudo chmod 777 /home/vagrant/.kube/
sudo chown -R jenkins /home/vagrant/.kube/
```

Once it's done, create a Jenkins pipeline in the `pipeline area` adding the script below. 

This script is analyzing the code in SonarQube, run unit and integration tests, build and push a docker image to Dockerhub and finally, deploy to `Kubernetes cluster`.

Two points that requires attention.

1. I'm setting some environment variables in the pipeline script itself only for simplicity, but that should configured using Jenkins' plugin.
2. The method `buildImage()` tag our image with the hash of the last git commit. These brings us many benefits since every built artifact has a machine-assigned unique number, therefore, every artifact is potentially shippable, so there is no need for a dedicated release workflow anymore and the delivery pipeline is traceable we don't need git tag is not necessary anymore.

```java
def hash() {
    stdout = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
    println("HASH = ${stdout}")
    return stdout
}

def buildImage() {
    registry = "metiago/starter"
    tag = hash()
    sh "docker build -t " + registry + ":" + tag + " ."
}

def pushDockerImage() {
    registry = "metiago/starter"
    tag = hash()
    sh 'docker push ' + registry + ":" + tag
}

def changeDescriptor() {
    tag = hash()
    sh "sed -i.bak 's/<tag>/${tag}/g' k8s/deployment.yaml"
}

def deployImage() {
    sh """
        . /home/vagrant/venv/bin/activate
        sleep 1
        kubectl apply -f k8s/deployment.yaml
        kubectl apply -f k8s/loadbalancer.yaml
    """
}

pipeline {
    environment {
        registryCredential = 'dockerhub'

        KUBECONFIG='/home/vagrant/.kube/config'
        AWS_ACCESS_KEY_ID='MY-KEY'
        AWS_SECRET_ACCESS_KEY='MY-SECRET'
        AWS_DEFAULT_REGION='MY-REGION'
    }
    agent {
        node {
            label 'built-in'
            customWorkspace "/var/lib/jenkins/workspace/starter"
        }
    }
    stages {
        stage('Cloning...') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[credentialsId: 'github', url: 'git@github.com:metiago/starter-ci.git']]]))
            }
        }
        stage('SonarQube Analysis') {
            steps {
                sh 'mvn sonar:sonar -Dsonar.host.url=http://192.168.50.5:9000'
            }
        }
        stage('Unit Testing') {
            steps {
                 echo 'Running Unit Tests...'
                 sh 'mvn clean test'
            }
        }
        stage('Integration Testing') {
            steps {
                echo 'Running Integration Tests...'
                sh 'mvn clean verify'
            }
        }
        stage('Dockerizing') {
            steps {
                buildImage()
            }
        }
        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'dockerHubPassword', usernameVariable: 'dockerHubUser')]) {
                    sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPassword}"
                    pushDockerImage()
                }                
            }
        }
        stage('Deploying') {
            steps{
                changeDescriptor()
                deployImage()
            }
        }
    }
}
```

![Jenkins Pipeline](/images/ci/jenkins_pipeline.png)

If the build succeed, we can get your load balancer endpoint by `kubectl describe service` and then making a request to the application health check endpoint.

![EKS Request](/images/ci/eks_request.png)

### Workflow

This diagram below give us a macro overview about the pipeline.

![CI Diagram](/images/ci/diagram.png)

That's an example of how to set up Jenkins pipeline to deploy a Java application in the Kubernetes. Remember that, there's a difference between continues delivery and continue deployment processes. Basically, continuous delivery is the practice of ensuring that software is always ready to be deployed to any environment (STAGE, QA, ETC), usually it requires manual intervention (one click button) to release the last artifact. On the other hand, 
continuous deployment is the next step of continuous delivery, every change that passes the automated tests is deployed to production automatically.