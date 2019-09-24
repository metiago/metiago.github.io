---
layout: default
title:  Python - Random Game
date:   2019-06-12 20:18:00 +0100
category: Dev
---

## Python Guess Game

In this simple example, I'm posting a simple Python guessing game to demostrate how to use the random module.

```python
import random

secret = random.randint(1, 100)
win = False

for i in range(0,5):
    guess = int(input("Guess a number:"))
    if guess == secret:
        win = True
        break
    elif guess > secret:
        print("Too high!")
    else:
        print("Too low!")

if win:
    print("You win!")
else:
    print("You lose!")
```