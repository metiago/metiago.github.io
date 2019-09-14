---
layout: default
title:  Python – How to list all files in a directory
date:   2019-04-19 20:18:00 +0100
category: Dev
---

## Python – How to list all files in a directory ?
In Python, we can use os.walker or glob to create a find() like function to search or list files or folders in a specified directory and also it’s subdirectories.

#### Example
```python
import os

path = '.'

files = []
# r=root, d=directories, f = files
for r, d, f in os.walk(path):
    for file in f:
        if '.md' in file:
            files.append(os.path.join(r, file))

for f in files:
    print(f)
```

