---
title: 'OS – Listing used ports'
date: 2013-01-04T19:18:41-03:00
draft: false
---

#### Linux 

```bash
# Checking
lsof -i :8080

# If the command above returns multiple result, filter it
lsof -i :8080 | grep LISTEN

# Find out application details
ps -ef | grep <PID>
```