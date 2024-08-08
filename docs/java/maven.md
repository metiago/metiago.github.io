---
title: "Maven"
date: 2024-05-17T16:02:09-03:00
---

This script is a shell script designed to run tests for a Java project using Maven.

```bash
#!/bin/sh

clear

export JAVA_HOME="C:\\Users\\<username>\\.jdks\\corretto-17.0.11"

export PATH=$PATH:"C:\\Users\\<username>\\.jdks\\corretto-17.0.11\\bin"

mvn test -Dtest=CacheControllerTest#getAllCaches -Dspring.profiles.active=test test

```

1. **`#!/bin/sh`**: This is called a shebang. It specifies that the script should be run using the `/bin/sh` shell.

2. **`clear`**: This command clears the terminal screen. It's often used to make the output of the script easier to read by removing any previous text.

3. **`export JAVA_HOME="C:\\Users\\<username>\\.jdks\\corretto-17.0.11"`**: This sets the `JAVA_HOME` environment variable to the path where the JDK (Java Development Kit) is installed. `<username>` should be replaced with the actual username of the person running the script. This variable helps tools like Maven locate the Java installation.

4. **`export PATH=$PATH:"C:\\Users\\<username>\\.jdks\\corretto-17.0.11\\bin"`**: This adds the `bin` directory of the JDK to the `PATH` environment variable. This allows the system to find and execute Java commands like `java` and `javac` from the command line.

5. **`mvn test -Dtest=CacheControllerTest#getAllCaches -Dspring.profiles.active=test test`**: This runs Maven (`mvn`) with the following parameters:
   - `test`: This is the Maven goal to run tests.
   - `-Dtest=CacheControllerTest#getAllCaches`: This specifies that only the `getAllCaches` method of the `CacheControllerTest` class should be run.
   - `-Dspring.profiles.active=test`: This sets the active Spring profile to `test`, which can be used to configure different settings or behaviors for testing.
   - `test`: This is another instance of the `test` goal, ensuring that tests are executed.

In summary, this script sets up the Java environment and runs a specific test method using Maven with a designated Spring profile. Make sure to replace `<username>` with the appropriate username for your system.
