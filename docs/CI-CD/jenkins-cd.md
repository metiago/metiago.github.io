---
title: 'Continuous Delivery of Java Applications with Docker'
date: 2019-04-11T19:18:41-03:00
draft: false
---


Continuous delivery (CD) is fundamentally a set of practices and disciplines in which software delivery teams produce valuable and robust software in short cycles. Care is taken to ensure that functionality is added in small increments and that the software can be reliably released at any time.

This post demonstrate how set up a continuous delivery pipeline using `Jenkins`, `SonarQube` and `Kubernetes` deploying a dockerized Java application into `AWS EKS`.

First of all, we have to set up our <a href="{{site.github.url/posts/jenkins-ci" target="_blank">Continuous Integration</a> server.

After that, we should follow these steps in order to configure aws cli and kubectl to interact with our EKS cluster.

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

Once it's done, create a Jenkins pipeline and in the `pipeline area` add the script below. 

The procedure of this script is analyzing the code on SonarQube, run unit and integration tests, create and push a docker image to Dockerhub registry and in the end, deploy to `Kubernetes cluster`.

Two points that requires attention.

1. I'm setting some environment variables in the pipeline script itself ony for a matter of simplicity, but that should configured using Jenkins' plugin.
1. The method `buildImage()` tag our image with the hash of the last git commit. These brings us many benefits since every built artifact has a machine-assigned unique number, therefore, every artifact is potentially shippable, so there is no need for a dedicated release workflow anymore and the delivery pipeline is 
traceable we don't need git tag is not necessary anymore.

```groovy
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
                checkout([$class: 'GitSCM', branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[credentialsId: 'github', url: 'git@github.com:metiago/starter-ci.git']]])
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

<img src="/images/site/ci/jenkins_pipeline.png" width="auto" >

If the build succeed, we can get your load balancer endpoint by `kubectl describe service` and then making a request to the application health check endpoint.

<img src="/images/site/ci/eks_request.png" width="auto" >

### Workflow

This diagram below give us a macro overview about the pipeline.

<img src="/images/site/ci/diagram.png" width="auto" >

That's an example of how to set up Jenkins pipeline to deploy a Java application in the Kubernetes. Remember that, there's a difference between continues delivery and continue deployment processes. Basically, continuous delivery is the practice of ensuring that software is always ready to be deployed to any environment (STAGE, QA, ETC), usually it requires manual intervention (one click button) to release the last artifact. On the other hand, 
continuous deployment is the next step of continuous delivery, every change that passes the automated tests is deployed to production automatically.
