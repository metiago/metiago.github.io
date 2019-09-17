---
layout: default
title:  Python – Lists
date:   2019-05-03 20:18:00 +0100
category: Dev
---

## Python – Lists
In this simple reference, I'll show you how to loop over List data structure in Python

```python
# Create a list of fruits
fruits = ["apple", "banana", "cherry"]


# Iterate over fruits ex. 1
for f in fruits:
    print(f)


# Iterate over fruits ex. 2
length = len(fruits)
for i in range(length): 
    print(fruits[i])


# Iterate over fruits ex. 3
length = len(fruits) 
i = 0
while i < length:
    print(list[i]) 
    i += 1


# Using list comprehension ex. 4 
[print(i) for i in fruits]


# Using enumerate()  ex. 5
for i, val in enumerate(list): 
    print (i, ",",val)
```