---
layout: post
title:  UFW Linux Firewall 
date:   2018-09-03 20:18:00 +0100
category: Dev
tags: os linux firewall
---

UFW - Uncomplicated Firewall, is an interface for Linux IpTables which makes easy to manage firewall settings on host-based firewalls.

Sometimes, we as developers, need to open or close ports of the computer in order to test our applications. Below there are some examples of how to use UFW.

```bash
# enable the firewall
ufw enable

# block all ingoing traffic
ufw allow in to any

# block all outgoing traffic
ufw deny out to any

# block outgoing traffic to port
ufw deny out to any port 3433

# block outgoing traffic by range TCP protocol
ufw deny out 4700:5000/tcp

# block outgoing traffic by range UDP protocol
ufw deny out 4700:5000/udp

# allow ingoing traffic to port
ufw allow to any port 443

# reset all rules to default
ufw reset

# reload rules
ufw reload
```

#### Shell Script

```bash
#!/bin/sh

# PRIVATE SERVICE OUT
ufw deny out to any port 5671
ufw deny out to any port 61614
ufw deny out to any port 1883

# PRIVATE SERVICE IN
ufw deny to any port 5671
ufw deny to any port 61614
ufw deny to any port 1883

# PRIVATE WEB SERVICE  OUT
ufw deny out to any port 3433
ufw deny out 4700:5000/tcp
ufw deny out to any port 5668
ufw deny out to any port 5669
ufw deny out to any port 6080
ufw deny out to any port 6443
ufw deny out to any port 8667
ufw deny out to any port 9667
ufw deny out 30011:30013/tcp

# WS
ufw deny out to any port 443
ufw deny to any port 443

echo 'Reloading Rules...'
ufw reload
```