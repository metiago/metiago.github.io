---
title:  'MySQL 8 - AWS EC2'
date: 1500-04-02T19:18:41-03:00
draft: true
---

### 1. Key Pairs

Creating public/private key  AWS Network & Security dashboard.


```ssh
# create private and public keys
ssh-keygen -m PEM

# import public key
aws ec2 import-key-pair --key-name "my-key" --public-key-material fileb://~/.ssh/my-key.pub
```

####  2. Security Group

Security group define rules for the VPC allowing incoming or outcoming network traffic into the new server.

```ssh
aws ec2 create-security-group --group-name my-sg --description "My security group" --vpc-id vpc-1a2b3c4d
```

### 3. Create EC2 Instance

Remember to select the security group created previouslly as well as the keypair when requested for.

```ssh
# List all OS images
aws ec2 describe-images   --output table   --query 'Images[*].[VirtualizationType,Name,ImageId]'   --owners 309956199498   --filters     Name=root-device-type,Values=ebs     Name=image-type,Values=machine     Name=is-public,Values=true     Name=hypervisor,Values=xen     Name=architecture,Values=x86_64

# create an instance based at one AWS image ids
aws ec2 run-instances --image-id ami-29bdc246 --security-group-ids sg-1aae5272 --count 1 --instance-type t2.micro --key-name my-key --query 'Instances[0].InstanceId'
```

### 4. SSH Into the server

```ssh
ssh -i my-private-key ubuntu@ec2-18-218-55-229.us-east-2.compute.amazonaws.com
```

### 5. Set up MySQL

```ssh
sudo apt update -y

wget https://dev.mysql.com/get/mysql-apt-config_0.8.12-1_all.deb

sudo dpkg -i mysql-apt-config_0.8.12-1_all.deb

sudo apt-get update

sudo apt-cache policy mysql-server

sudo apt install mysql-server

sudo mysql secure_installation
```

### 6. Enable MySQL Remote Access

```ssh
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# By default we only accept connections from localhost
bind-address = 0.0.0.0

sudo systemctl restart mysql
```
