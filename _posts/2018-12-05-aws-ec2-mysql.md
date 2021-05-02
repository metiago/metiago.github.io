---
layout: post
title:  Set up MySQL 8 in AWS EC2
date:   2018-12-05 20:18:00 +0100
category: Dev
tags: aws mysql databases
---

These steps below are references to set up MySQL in a EC2 instance in order to have a development database which can be used among team members.

#### 1. Key Pairs

#####  Before create a EC2 instance, we need to create a public/private key and then import it on the AWS Network & Security dashboard.


```ssh
# create private and public keys
ssh-keygen -m PEM

# import public key
aws ec2 import-key-pair --key-name "my-key" --public-key-material fileb://~/.ssh/my-key.pub
```

#####  2. Security Group

#####  Security group allows you to define rules for the VPC so that we can deny or allow incoming or outcoming network traffic on the new server. It can be created on AWS console or using the command line.

```ssh
aws ec2 create-security-group --group-name my-sg --description "My security group" --vpc-id vpc-1a2b3c4d
```

#### 3. Create EC2 Instance

#####  This can be created directly on the web console or via CLI. Remember to select the security group created previouslly as well as the keypair when requested for.

```ssh
# List all OS images
aws ec2 describe-images   --output table   --query 'Images[*].[VirtualizationType,Name,ImageId]'   --owners 309956199498   --filters     Name=root-device-type,Values=ebs     Name=image-type,Values=machine     Name=is-public,Values=true     Name=hypervisor,Values=xen     Name=architecture,Values=x86_64

# create an instance based at one AWS image ids
aws ec2 run-instances --image-id ami-29bdc246 --security-group-ids sg-1aae5272 --count 1 --instance-type t2.micro --key-name my-key --query 'Instances[0].InstanceId'
```

#### 4. SSH Into The Server

##### Once the instance is up and running you can log into it.

```ssh
ssh -i my-private-key ubuntu@ec2-18-218-55-229.us-east-2.compute.amazonaws.com
```

#### 5. Set up MySQL 8

##### After successfully logged in, we can now install our database server.

```ssh
sudo apt update -y

wget https://dev.mysql.com/get/mysql-apt-config_0.8.12-1_all.deb

sudo dpkg -i mysql-apt-config_0.8.12-1_all.deb

sudo apt-get update

sudo apt-cache policy mysql-server

sudo apt install mysql-server

sudo mysql secure_installation
```

#### 6. Enable MySQL Remote Access

```ssh
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# By default we only accept connections from localhost
bind-address = 0.0.0.0

sudo systemctl restart mysql
```