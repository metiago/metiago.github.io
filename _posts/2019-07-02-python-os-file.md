---
layout: default
title:  Python - Standard Library Examples
date:   2019-06-27 20:18:00 +0100
category: Dev
---

## Python Standard Library Examples

In this post, I'm going to share a simple example to manipulate files with Python standard library, these libraries are called
`shutil` and `path` respectively, follow below a self-explanatory code.

```python
import shutil
from os import path

FLASK_FILE="flask.txt"

def main():    
    try:
        if path.exists(FLASK_FILE):
            src = path.realpath(FLASK_FILE)
            if not path.isfile(src):
                raise FileNotFoundError("File {} is not a file.".format(FLASK_FILE))    
        else:
            raise FileNotFoundError("File {} not found".format(FLASK_FILE))
        file_path, file_name = path.split(src)
        print("Copying file {} in {} folder".format(file_name, file_path))    
        dest = src + ".bak"
        shutil.copy(src, dest)
    except Exception as e:
        print(e)

if __name__=="__main__":
    main()
```