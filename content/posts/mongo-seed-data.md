+++
title =  'MongoDB Quick Reference'
date = 2017-04-13T19:18:41-03:00
draft = false
+++

### MongoDB Backup

The mongodump command will create a backup / dump of the MongoDB database with the name specified by the --db [DB NAME] argument.

The --out /home/db/backups/`date +"%Y%m%d" argument specifies the output directory as /home/db/backups/[TODAY'S DATE] 
e.g. /home/db/backups/20190903.

```java
sudo mongodump --db [DB NAME] --out /var/backups/`date +"%Y%m%d"`
```

### MongoDB Restore

The mongorestore command restores a database to the destination --db [DB NAME] from the specified directory, e.g. /home/db/backups/20190903.

```java
sudo mongorestore --db [DB NAME] /home/db/backups/[BACKUP FOLDER NAME]
```
