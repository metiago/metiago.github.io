---
layout: default
title:  Linux – Listing used ports
date:   2019-08-18 20:18:00 +0100
category: Dev
---

## Linux – Listing used ports

Below there are some commands that is pretty useful to check which application has been using a given port.

## Linux Example

```bash
# Checking
lsof -i :8080

# If the command above returns multiple result, filter it
lsof -i :8080 | grep LISTEN

# Find out application details
ps -ef | grep <PID>
```

## Windows Example
```bash
netstat -nlp | grep 8080
```