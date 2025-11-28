---
title: 'JVM Z (GC)'
date: "2024-07-03"
draft: false
---

## Enabling Z Garbage Collector (ZGC) in JVM

The **Z Garbage Collector (ZGC)** is a low-latency garbage collector introduced in JDK 11. It aims to minimize pause times regardless of heap size, making it suitable for large memory applications.

### Steps to Enable Z Garbage Collector

1. **JVM Version**: ZGC is available starting from **JDK 11**. Ensure you are using at least this version.

2. **Command-Line Option**: To enable ZGC, use the `-XX:+UseZGC` option. Start your Java application with the following command:

   ```bash
   java -XX:+UseZGC -jar your-application.jar
   ```

3. **Heap Size Specifications**: Similar to G1, you may wish to specify the initial and maximum heap sizes using `-Xms` and `-Xmx`. Example:

   ```bash
   java -Xms512m -Xmx8g -XX:+UseZGC -jar your-application.jar
   ```

4. **Tuning Parameters**: ZGC has several tuning options to further optimize performance:

   - `-XX:ZCollectionInterval=<n>`: Set the interval for concurrent collections (in milliseconds).
   - `-XX:ZFragmentationLimit=<n>`: Define the limit for memory fragmentation.
   - `-XX:ZUncommitDelay=<n>`: Set the delay before uncommitting memory.

5. **Monitoring and Logging**: To monitor ZGC performance, you can enable logging using:

   ```bash
   -Xlog:gc*
   ```

### Example Command

Here’s how you might initialize your application with ZGC enabled and include tuning options:

```bash
java -Xms1g -Xmx16g -XX:+UseZGC -XX:ZCollectionInterval=100 -Xlog:gc* -jar your-application.jar
```

This command demonstrates how to set specific heap sizes and logging while using ZGC.

---
