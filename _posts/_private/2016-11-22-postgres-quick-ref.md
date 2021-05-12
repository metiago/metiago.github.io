---
layout: post
title:  Postgres Quick Ref
date:   2016-11-22 20:18:00 +0100
category: Dev
tags: postgres databases
---

#### Postgres Quick Ref

Simple reference to quick start working with Postgres SQL

```bash

### Create database

-U postgres -A password -E utf8 -W -D C:\Users\tiago.ribeiro\Desktop\Java\pgsql\database

### Start Service
"pg_ctl" -D "C:\Users\tiago.ribeiro\Desktop\Java\pgsql\database" -l logfile start

### Stop Service
"pg_ctl" -D "C:\Users\tiago.ribeiro\Desktop\Java\pgsql\database" -l logfile stop

### To login with admin
psql postgres postgres

### To create a user
CREATE USER tiago WITH PASSWORD 'zero';

ALTER USER postgres with password ‘new-password’;

### To create a database
CREATE DATABASE myproject;

### Given grants
grant all privileges on database myproject to tiago;

### To log into db
psql DBNAME USERNAME

```
