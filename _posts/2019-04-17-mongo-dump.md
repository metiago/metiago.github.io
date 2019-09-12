---
layout: default
title:  MongoDB - How to backup and restore a database
date:   2019-04-17 20:18:00 +0100
category: Dev
---

#### Backup MongoDB database using date for the folder name
The mongodump command will create a backup / dump of the MongoDB database with the name specified by the --db [DB NAME] argument.

The --out /home/db/backups/`date +"%Y%m%d" argument specifies the output directory as /home/db/backups/[TODAY'S DATE] 
e.g. /home/db/backups/20190903.

```java
sudo mongodump --db [DB NAME] --out /var/backups/`date +"%Y%m%d"`
```

#### Restore MongoDB database from backup
The mongorestore command restores a database to the destination --db [DB NAME] from the specified directory, e.g. /home/db/backups/20190903.
```java
sudo mongorestore --db [DB NAME] /home/db/backups/[BACKUP FOLDER NAME]
```