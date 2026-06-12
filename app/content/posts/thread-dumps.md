---
title: 'Generating JVM Thread Dumps Programmatically with Java New dumpThreads() API'
date: "2016-05-16"
draft: false
---

When diagnosing performance issues, deadlocks, or application hangs, one of the most valuable tools available to Java developers is a thread dump.

Traditionally, generating a thread dump required external tools such as `jstack`, `jcmd`, or sending signals directly to the JVM process. However, recent JDK versions introduced a new API that allows applications and management tools to generate thread dumps programmatically through the `HotSpotDiagnosticMXBean`.

## What Is a Thread Dump?

A thread dump is a snapshot of all threads running inside a JVM at a specific moment.

It typically contains:

* Thread names and IDs
* Current thread states (`RUNNABLE`, `WAITING`, `BLOCKED`, etc.)
* Stack traces
* Lock ownership information
* Deadlock details
* Virtual thread information (when applicable)

Thread dumps are commonly used to investigate:

* Application hangs
* Deadlocks
* High CPU usage
* Thread starvation
* Slow requests
* Resource contention

## The New `dumpThreads()` API

The `HotSpotDiagnosticMXBean` now provides a `dumpThreads()` method that allows thread dumps to be written directly to a file.

```java
public void dumpThreads(
    String outputFile,
    ThreadDumpFormat format
) throws IOException;
```

The method accepts:

* An absolute output file path
* A format from the `ThreadDumpFormat` enum

Supported formats include:

```java
HotSpotDiagnosticMXBean.ThreadDumpFormat.TEXT_PLAIN
HotSpotDiagnosticMXBean.ThreadDumpFormat.JSON
```

## Creating a Utility Method

The following utility method generates a thread dump and stores it as JSON.

```java
import com.sun.management.HotSpotDiagnosticMXBean;

import java.io.File;
import java.io.IOException;
import java.lang.management.ManagementFactory;

public class ThreadDumpUtil {

    public static void takeThreadDump(String outputFile) {

        var hotSpotDiagnosticMXBean =
                ManagementFactory.getPlatformMXBean(
                        HotSpotDiagnosticMXBean.class);

        try {

            if (!new File(outputFile).isAbsolute()) {
                throw new IllegalArgumentException(
                        "Output path must be absolute.");
            }

            hotSpotDiagnosticMXBean.dumpThreads(
                    outputFile,
                    HotSpotDiagnosticMXBean.ThreadDumpFormat.JSON);

        } catch (IOException e) {
            throw new RuntimeException(
                    "An error occurred while taking thread dump",
                    e);
        }
    }
}
```

Usage is straightforward:

```java
ThreadDumpUtil.takeThreadDump(
        "/tmp/thread-dump.json");
```

After execution, the JVM will create a thread dump file at the specified location.

## Why Must the Path Be Absolute?

The API requires an absolute file path.

This works:

```java
"/tmp/thread-dump.json"
```

This does not:

```java
"thread-dump.json"
```

Providing a relative path results in an exception.

A simple validation check before calling `dumpThreads()` helps avoid runtime errors.

## Plain Text vs JSON

One of the most interesting additions is support for JSON output.

### Plain Text

```java
hotSpotDiagnosticMXBean.dumpThreads(
    "/tmp/threads.txt",
    HotSpotDiagnosticMXBean.ThreadDumpFormat.TEXT_PLAIN);
```

The generated file resembles traditional `jstack` output:

```text
"main" #1
java.lang.Thread.State: RUNNABLE
...
```

This format is ideal for human inspection.

### JSON

```java
hotSpotDiagnosticMXBean.dumpThreads(
    "/tmp/threads.json",
    HotSpotDiagnosticMXBean.ThreadDumpFormat.JSON);
```

The output becomes machine-readable:

```json
{
  "threadName": "main",
  "threadId": 1,
  "threadState": "RUNNABLE"
}
```

JSON is particularly useful for:

* Monitoring platforms
* Automated diagnostics
* Log aggregation systems
* Custom analysis tools
* Observability pipelines

## Production Use Cases

### 1. Capture a Dump When Timeouts Spike

If an application starts experiencing unusual request timeouts, a thread dump can be generated automatically.

```java
if (timeoutCount > 100) {
    ThreadDumpUtil.takeThreadDump(
        "/var/log/dumps/timeouts.json");
}
```

This allows engineers to investigate what the JVM was doing during the incident.

### 2. Expose an Administrative Endpoint

Many teams create an internal endpoint that triggers a thread dump.

```java
@PostMapping("/admin/thread-dump")
public void threadDump() {
    ThreadDumpUtil.takeThreadDump(
        "/tmp/admin-dump.json");
}
```

This is especially useful in containerized environments where shell access may be restricted.

### 3. Generate Diagnostics Before Shutdown

A shutdown hook can capture the application's state before termination.

```java
Runtime.getRuntime().addShutdownHook(
    new Thread(() ->
        ThreadDumpUtil.takeThreadDump(
            "/logs/shutdown.json")
    )
);
```

### 4. Remote JMX Diagnostics

Because the API is exposed through an MXBean, JMX clients can invoke it remotely.

This makes it possible to collect thread dumps from production JVMs without logging into the host machine.

## How Does This Compare to `jstack`?

| Feature                       | jstack  | dumpThreads() |
| ----------------------------- | ------- | ------------- |
| Requires OS access            | Yes     | No            |
| Can be automated              | Limited | Yes           |
| Available via JMX             | No      | Yes           |
| JSON output                   | No      | Yes           |
| Works inside application code | No      | Yes           |

For manual investigations, `jstack` and `jcmd` remain excellent tools.

For automated diagnostics and observability workflows, `dumpThreads()` provides significantly more flexibility.

## Final Thoughts

The new `dumpThreads()` API brings thread dump generation directly into Java applications and management tooling.

Its biggest advantages are:

* Programmatic access
* Integration with JMX
* Support for structured JSON output
* Easier automation in cloud and container environments

If you're building operational tooling, observability features, or self-diagnosing applications, this API provides a clean and modern way to capture thread dumps without relying on external JVM utilities.
