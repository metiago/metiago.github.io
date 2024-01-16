+++
title = ' Apache AB'
date = 1500-04-19T19:18:41-03:00
draft = true
+++

How to load test Rest APIs with Apache AB.

```bash
# Execute 100 requests with 10 concurrent clients and save the results in a result.txt file
ab -n 100 -c 10 https://example.com/ > result.txt

# Execute 10 post request with 10 concurrent clients and save the results in a login_results.txt file
# login.txt is a simple txt file which contains a json structure e.g  {"username":"admin", "password":"123"}
ab -p login.txt -T application/json -c 10 -n 10 https://myapi/auth/login > login_results.txt

```

## Reference

<a href="https://httpd.apache.org/docs/2.4/programs/ab.html" target="_blank">https://httpd.apache.org/docs/2.4/programs/ab.html</a>
