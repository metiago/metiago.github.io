---
title: 'Apache AB'
date: "2014-03-03"
draft: false

---

The ab command is a command line load testing and benchmarking tool for web servers that allows you to simulate high traffic to a website.

### Execute 100 requests with 10 concurrent clients and save the results in a result.txt file
```bash
ab -n 100 -c 10 https://example.com/ > result.txt
```

### Execute 10 post request with 10 concurrent clients and save the results in a login_results.txt file

```bash
ab -p login.txt -T application/json -c 10 -n 10 https://myapi/auth/login > login_results.txt
```

> Note: `login.txt` is a simple txt file which contains a json structure e.g 
```bash 
{"username":"admin", "password":"123"} 
```