---
layout: default
title:  Python – Dictionary
date:   2019-04-19 20:18:00 +0100
category: Dev
---

## Python – Lists
In this simple reference, I'll show you how to loop over Dict data structure in Python

```python
# Create a dict of fruits
fruits = {"apple": 1.90, "banana": 2.30, "cherry": 3.99}

# List all keys
for f in fruits:
    print(f)


# List all values
for f in fruits.values():
    print(f)


# List all keys and values
for k, v in fruits.items():
    print(k, ":", v)
```