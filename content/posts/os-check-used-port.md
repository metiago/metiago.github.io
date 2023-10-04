+++

title =  'OS – Listing used ports'
date = 1500-01-04T19:18:41-03:00


+++

###### Linux 

```bash
# Checking
lsof -i :8080

# If the command above returns multiple result, filter it
lsof -i :8080 | grep LISTEN

# Find out application details
ps -ef | grep <PID>
```