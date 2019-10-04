---
layout: default
title:  Python - Requests Library
date:   2019-06-27 20:18:00 +0100
category: Dev
---

## Python Requests Library

In this post, I'm sharing a simple Python code that I had to implement to fetch some sample data from a given API
in one of my job experience.

The main idea is just to demostrate how powerful and useful is `Python Requests Library`. 

You can see the requests library [here](https://pypi.org/project/requests/)

## Bot Example 

First we need to configure our environment, this example was developed using `Python 3.6+`

```bash
virtualenv venv
source venv\bin\activate
pip install requests
```

Now we are ready to implement our code, as demonstrated below.

```python
import time
import math
import json

import requests


def authorize():
    ''' This method is responsible to get a JWT from the authorization endpoint '''

    res = requests.post("https://54.93.95.128/manage/v1/users/login", data={"username":"admin","password":"fa39d424037d94cb4efcbfd5e4b05b9e6a8bb91c"}, verify=False)
    headers = res.headers
    return headers['Access-Token']


def get_total_records(token):
    ''' This method is responsible to fetch all vehicles for the first page '''

    cookies = {'Access-Token': token}
    res = requests.get("https://54.93.95.128/manage/v1/vehicles?page=0&page_size=10", verify=False, cookies=cookies)
    json_response = res.json()
    return json_response['data']['count']


def poll_vin(token, total_records):
    ''' This method is recursivly called to get date from all pages '''
    
    cookies = {'Access-Token': token}
    page = 0
    pages = math.ceil(total_records / 10)
    while page <= pages:
        res = requests.get("https://54.93.95.128/manage/v1/vehicles?page={}&page_size=10".format(page), verify=False, cookies=cookies)
        json_response = res.json()
        vehicles = json_response['data']['vehicles']
        for v in vehicles:
            post_vin(v['vin'])
            time.sleep(5)
        page = page + 1
        time.sleep(30)


def post_vin(number):
    '''This method do a post request to another API in order to persit vehicles information in block-chain.'''
    
    headers = {'Content-Type': 'application/json'}    
    data = dict(vin=number, status=True)    
    res = requests.post("http://pyg.westeurope.cloudapp.azure.com:8080/api/v1/b2c/ethereum/usersConsent", 
                        headers=headers, 
                        data=json.dumps(data))

    if res.status_code == 200:
        print("{} has been sent successfully".format(number))
    else:
        print("{} has errors".format(res))


if __name__ == "__main__":
    token = authorize()
    total_records = get_total_records(token)
    poll_vin(token, total_records)
```

After implement our code, you can test it executing the following command

```bash
python mycode.py
```