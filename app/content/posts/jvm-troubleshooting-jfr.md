---
title: "Java Production Troubleshooting: A Practical Guide with JFR and jcmd"
date: "2026-10-23"
draft: false
---

Knowing what JFR does is useful. Knowing which command to run when your application is slow, consuming too much memory, or blocking requests is even better.

This section provides a small Spring Boot playground and a practical JVM troubleshooting cheat sheet.

> **Requirements:** JDK 25+ for the complete command reference, Spring Boot, bash for the load-generation examples, and JDK Mission Control for visual analysis. Some commands also work on earlier JDK versions.

### 1. Reproduce the Problems

Create a Spring Boot application with two endpoints:

- /leak — Retains approximately 5 MB of memory per request.
- /block — Holds a shared lock for five seconds, forcing concurrent requests to wait.

```java
package io.tiago.high_memory_cpu;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class BadController {

    private static final List<byte[]> leakStorage =
            new ArrayList<>();

    private final Object globalLock = new Object();

    @GetMapping("/leak")
    public String leakMemory() {
        byte[] data = new byte[5 * 1024 * 1024];

        synchronized (leakStorage) {
            leakStorage.add(data);
            return "Allocated blocks: " + leakStorage.size();
        }
    }

    @GetMapping("/block")
    public String blockThreads() {
        synchronized (globalLock) {
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        return "Request completed";
    }
}

@SpringBootApplication
public class HighMemoryCpuApplication {

    public static void main(String[] args) {
        SpringApplication.run(
            HighMemoryCpuApplication.class, args
        );
    }
}
```

**Trigger memory growth**

Run in bash:

```bash
1..100 | ForEach-Object {
    Invoke-WebRequest http://localhost:8080/leak
}
```

This retains approximately 500 MB of byte arrays. Depending on your heap configuration, the application may eventually throw an OutOfMemoryError.

**Trigger thread contention**

Run in a separate bash window:

```bash
1..10 | ForEach-Object {
    Start-Job -ScriptBlock {
        Invoke-WebRequest http://localhost:8080/block
    }
}

Get-Job | Wait-Job | Receive-Job
```

The requests compete for the same monitor, producing blocked threads and increased response times.

> This example demonstrates thread contention, not a true deadlock. Run these experiments locally or in an isolated test environment, never against production traffic.

### 2. First Response: Inspect the Running JVM

When investigating a Java application, start by identifying its process and checking the JVM state.

Replace 24476 with your actual Java process ID (PID).

| Goal | Command |
|---|---|
| Find Java processes | jcmd |
| List available commands | jcmd 24476 help |
| Check JVM uptime | jcmd 24476 VM.uptime |
| Inspect JVM flags | jcmd 24476 VM.flags |
| Inspect system properties | jcmd 24476 VM.system_properties |
| Check heap information | jcmd 24476 GC.heap_info |
| Inspect thread states | jcmd 24476 Thread.print -l |

**Tip:** Start with observation before changing anything. Thread dumps, heap information, and JFR recordings often provide enough evidence to narrow down a problem.

### 3. Diagnose Memory Problems

If heap usage keeps growing or garbage collection becomes increasingly frequent, inspect memory allocation and retained objects.

| Goal | Command |
|---|---|
| Inspect heap regions | jcmd 24476 GC.heap_info |
| Find classes consuming memory | jcmd 24476 GC.class_histogram |
| Inspect finalizer queue | jcmd 24476 GC.finalizer_info |
| Trigger garbage collection | jcmd 24476 GC.run |
| Capture a heap dump | jcmd 24476 GC.heap_dump C:\dumps\heap.hprof |

For native memory investigation, start the JVM with:

```bash
java -XX:NativeMemoryTracking=detail -jar myapp.jar
```

Then establish a baseline and compare later:

```bash
jcmd 24476 VM.native_memory baseline
jcmd 24476 VM.native_memory detail.diff
```

**What to look for:** Increasing live heap usage after garbage collection, growing object counts, unexpected retained objects, or native memory growth.

> **Production caution:** Heap dumps, class histograms, and explicit garbage collection can introduce pauses or significant overhead. Heap dumps may also contain sensitive application data. Native Memory Tracking must be enabled at JVM startup.

### 4. Diagnose Thread Blocking and Deadlocks

When requests become slow or stop completing, inspect thread states.

**Traditional thread dump**

```bash
jcmd 24476 Thread.print -l
```

**JSON thread dump (JDK 21+)**

```bash
jcmd 24476 Thread.dump_to_file -format=json C:\dumps\threads.json
```

Look for:

- BLOCKED — Waiting to acquire a Java monitor.
- WAITING — Waiting indefinitely for another action.
- TIMED_WAITING — Waiting with a timeout, such as Thread.sleep().
- RUNNABLE — Executing or eligible to run; not necessarily consuming CPU.

In our /block example, one request holds the monitor while others wait to acquire it.

For a real deadlock, look for cyclic lock dependencies. Traditional thread dumps may explicitly report detected Java-level deadlocks.

### 5. Capture a Java Flight Recording

JFR is especially useful when the issue is intermittent or difficult to reproduce.

**Start a 30-second recording**

```bash
jcmd 24476 JFR.start duration=30s settings=profile filename=C:\dumps\recording.jfr
```

**Check active recordings**

```bash
jcmd 24476 JFR.check
```

**Dump the current recording**

```bash
jcmd 24476 JFR.dump filename=C:\dumps\emergency.jfr
```

**Stop a recording**

```bash
jcmd 24476 JFR.stop
```

For multiple simultaneous recordings, use the recording name or ID to select the intended recording.

**Start recording when launching the application**

```bash
java -XX:StartFlightRecording=duration=60s,settings=profile,filename=boot.jfr -jar myapp.jar
```

**Configure a bounded continuous recording**

```bash
java -XX:StartFlightRecording=disk=true,maxsize=500m,maxage=1d -jar myapp.jar
```

Continuous recording retains a bounded history, useful for investigating incidents that occurred before troubleshooting began.

### 6. Analyze JFR Without Opening a GUI

The jfr command-line tool lets you inspect recordings directly.

Assuming the recording is saved at C:\dumps\recording.jfr:

| What to investigate | Command |
|---|---|
| Recording overview | jfr summary C:\dumps\recording.jfr |
| Raw recorded events | jfr print C:\dumps\recording.jfr |
| Export events to JSON | jfr print --json C:\dumps\recording.jfr |
| Available analysis views | jfr view all-views C:\dumps\recording.jfr |
| Thread CPU usage | jfr view thread-cpu-load C:\dumps\recording.jfr |
| Execution samples | jfr view execution-sample C:\dumps\recording.jfr |
| Garbage collection pauses | jfr view gc-pauses C:\dumps\recording.jfr |
| Pinned virtual threads | jfr view pinned-threads C:\dumps\recording.jfr |
| Network reads | jfr view socket-reads C:\dumps\recording.jfr |
| Network writes | jfr view socket-writes C:\dumps\recording.jfr |
| File reads | jfr view file-reads C:\dumps\recording.jfr |
| File writes | jfr view file-writes C:\dumps\recording.jfr |

These predefined views are available on recent JDK versions, including JDK 25. Available views and event data may differ across JDK releases and recording configurations.

You can also inspect recent JFR events directly from a running JVM:

```bash
jcmd 24476 JFR.view hot-methods
jcmd 24476 JFR.view memory-leaks-by-class
```

These commands require a compatible JDK and appropriate recording data. Memory leak analysis is an investigation aid, not definitive proof of a leak.

For deeper analysis, open the `.jfr` file in **JDK Mission Control (JMC)**.

### 7. Production Troubleshooting Cheat Sheet

When something goes wrong, use the symptoms to choose your first diagnostic steps.

| Symptom | Start with | Investigate |
|---|---|---|
| High CPU | Thread.print, JFR execution samples | Hot methods, busy threads |
| High heap usage | GC.heap_info, class histogram | Growing objects, retention |
| Frequent GC pauses | jfr view gc-pauses | Allocation pressure, GC duration |
| Slow or hanging requests | Thread.print -l | Lock contention, deadlocks, waiting |
| Native memory growth | VM.native_memory detail.diff | Off-heap allocations |
| Slow external services | JFR socket views | Network I/O latency |
| Slow disk operations | JFR file I/O views | File read/write latency |
| Virtual thread issues | jfr view pinned-threads | Carrier-thread pinning |

### Final Thoughts

JFR and jcmd should be part of every Java developer's production troubleshooting toolkit.

A practical workflow is:

1. **Identify** the affected Java process.
2. **Inspect** threads, heap, and JVM configuration.
3. **Record** the problem with JFR.
4. **Analyze** CPU, memory, garbage collection, and I/O events.
5. **Correlate** findings with application logs and metrics before making changes.

The goal is not to memorize every JVM command. It is to know which evidence to collect when production behaves unexpectedly.

**Official references:**
- [JDK jcmd documentation](https://docs.oracle.com/en/java/javase/25/docs/specs/man/jcmd.html)
- [JDK jfr documentation](https://docs.oracle.com/en/java/javase/25/docs/specs/man/jfr.html)
- [JDK Mission Control](https://openjdk.org/projects/jmc/)