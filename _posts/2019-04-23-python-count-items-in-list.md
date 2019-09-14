---
layout: default
title:  Python – Basic operators examples
date:   2019-04-23 20:18:00 +0100
category: Dev
---

## Python – Count the number of items in a list
In Python, we can use len() to count the number of items in a List

#### Example
```python
list = ["a", "b", "c"]
print(len(list))
```

## Python – Check if a String contains another String 
In Python, we can use in operator or str.find() to check if a String contains another String.

#### Example
```python
name = "this is a simple example with Python language"

# Using in operator
if "Python" in name:
    print("found!")
else:
    print("not found")

# Using find method
if name.find("Python") != -1:
    print("found!")
else:
    print("not found")

# For case-insensitive find, convert a given String to uppercase or lowercase before finding´
if name.upper().find("PYTHON") != -1:
    print("found")
else:
    print("not found")
```
