---
layout: default
title:  Python - Random Game
date:   2019-06-18 20:18:00 +0100
category: Dev
---

## Python using C and C++ libraries with ctypes

In this post, we'll see an example of how to use C or C++ libraries in Python

Before to run this example, you should install a C compiler. 
In Windows you download the compiler here [MinGW](https://osdn.net/projects/mingw/releases/).
In order to run the `gcc` command line, you should configure your `path environment variable` to e.g `C:\MinGW\bin`.

In Linux - Ubuntu 18, you can install it with 3 basic steps:
```bash
# 1.
sudo apt update
# 2.
sudo apt install build-essential
# 3.
sudo apt-get install manpages-dev
```

Now, let's see an example.

First create a C header file called `hello.h`

```c++
#pragma once
#ifdef __cplusplus
extern "C"
{
#endif
    void test_empty(void);
    float test_add(float x, float y);
    void test_passing_array(int *data, int len);
#ifdef __cplusplus
}
#endif
```
and then our implementation `hello.c`.

```c++
#include <stdio.h>
#include "hello.h"

void test_empty(void)
{
    puts("Hello from C");
}

float test_add(float x, float y)
{
    return x + y;
}

void test_passing_array(int *data, int len)
{
    printf("Data as received from Python\n");
    for (int i = 0; i < len; ++i)
    {
        printf("%d ", data[i]);
    }
    puts("");

    // Example modifying an array
    for (int i = 0; i < len; ++i)
    {
        data[i] = -i;
    }
}
```

After we create our C module we need to compile it and then it'll be ready to invoke from Python.

```bash
gcc -std=c11 -Wall -Wextra -pedantic -c -fPIC hello.c -o hello.o
gcc -shared hello.o -o hello.dll
```

```python
import sys
import ctypes, ctypes.util

lib_path = ctypes.util.find_library("C:/Users/ctw00244/Desktop/py-c/hello.dll")
if not lib_path:
    print("Unable to find the specified library.")
    sys.exit()

try:
    hello_lib = ctypes.CDLL(lib_path)

    # Calling method 1
    hello_lib.test_empty()
    
    # Calling method 2
    test_add = hello_lib.test_add
    test_add.argtypes = [ctypes.c_float, ctypes.c_float]
    test_add.restype = ctypes.c_float
    res = test_add(2.2, 2)
    print(res)

    # Calling method 3
    test_passing_array = hello_lib.test_passing_array
    test_passing_array.argtypes = [ctypes.POINTER(ctypes.c_int), ctypes.c_int]
    test_passing_array.restype = None
    numel = 25
    data = (ctypes.c_int * numel)(*[x for x in range(numel)])
    hello_lib.test_passing_array(data, numel)
    
except OSError:
    print("Unable to load the system C library")    
```