+++
title = 'Amazon Web Services'
date = 1500-04-18T19:18:41-03:00
draft = false
+++

Amazon web services quick reference

### Config AWS CLI

```bash
# Install
pip3 install awscli

# Config
aws configure
```

### S3

```bash
# policy to grant permissions for all
{
  "Version": "2008-10-17",
  "Id": "Policy-id",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::examplebucket/*",
      "Condition": {}
    }
  ]
} 

```

```bash
# List buckets
aws s3api list-buckets --query "Buckets[].Name"

# Empty bucket by name
aws s3 rm s3://bucket-name --recursive

# Count all files
aws s3 ls s3://bucket-name --recursive --summarize

### Copying objects between buckets

# Create bucket
aws s3 mb s3://tmp-bucket --region eu-west-3

# Copy files from one bucket to other
aws s3 sync s3://old-bucket s3://tmp-bucket --source-region eu-west-2 --region eu-west-3

# Delete bucket
aws s3 rb s3://old-bucket --force

aws s3 sync s3://tmp-bucket s3://new-bucket --source-region eu-west-3 --region eu-west-3
```


### Secret Manager

```bash
# list registered records
aws secretsmanager list-secrets

# reveal stored values by its name
aws secretsmanager get-secret-value --secret-id <secret-name> --output json
```