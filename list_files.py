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

if name.upper().find("PYTHON") != -1:
    print("found")
else:
    print("not found")
