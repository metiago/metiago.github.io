---
title: 'Spring Async - Quick Reference'
date: "2023-08-07"
draft: false

---

#### ThreadPoolTaskExecutor:

ThreadPoolTaskExecutor is one of the most commonly used implementations of TaskExecutor in Spring.
It manages a pool of threads and delegates task execution to these threads.
You can configure various properties of the thread pool, such as core pool size, maximum pool size, queue capacity, and thread keep-alive time.
This executor is suitable for scenarios where you want to control the number of concurrent tasks being executed and manage the resources allocated to task execution.

#### SimpleAsyncTaskExecutor:

SimpleAsyncTaskExecutor is a basic implementation of TaskExecutor that executes tasks asynchronously in a new thread for each task.
Unlike ThreadPoolTaskExecutor, it does not manage a thread pool. Instead, it creates a new thread for each task, which can lead to resource contention and scalability issues if used in high-concurrency scenarios.
This executor is suitable for lightweight asynchronous tasks or scenarios where the number of concurrent tasks is expected to be low and resource usage is not a concern.

#### ConcurrentTaskExecutor:

ConcurrentTaskExecutor is an adapter class that allows you to use a java.util.concurrent.Executor as a Spring TaskExecutor.
It delegates task execution to the underlying Executor provided by the Java concurrency framework.
This executor is useful when you want to leverage custom or third-party implementations of Executor provided by the Java concurrency framework, such as ForkJoinPool or ScheduledExecutorService.
It provides seamless integration between Spring's asynchronous task execution mechanism and Java's concurrency utilities.
In summary, ThreadPoolTaskExecutor is suitable for managing a pool of threads and controlling resource usage, SimpleAsyncTaskExecutor is suitable for lightweight asynchronous tasks with low concurrency, and ConcurrentTaskExecutor is useful for integrating with custom or third-party implementations of the Java Executor interface. Choose the appropriate executor based on your specific requirements and use case.

#### Summary 

For IO-bound tasks, where the tasks spend a significant amount of time waiting for input/output operations 
(such as reading from or writing to files, making network requests, or accessing databases), it's generally more suitable to use a ThreadPoolTaskExecutor rather than SimpleAsyncTaskExecutor or ConcurrentTaskExecutor.

#### Example

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "asyncTaskExecutor")
    public AsyncTaskExecutor asyncTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4); // Set the core pool size based on your requirements
        executor.setMaxPoolSize(8); // Set the maximum pool size based on your requirements
        executor.setQueueCapacity(100); // Set the queue capacity based on your requirements
        executor.setThreadNamePrefix("async-task-");
        return executor;
    }
}
```

In this example, Spring will create 4 threads and If there are more tasks it'll increase the number of threads until 8 and no more.

#### Core Pool Size

The "core pool size" refers to the number of threads that are kept alive in a thread pool, even when they are not actively executing tasks. These threads are known as "core threads" or "permanent threads."

Here's a more detailed explanation:

Core Pool Size: When a thread pool is created, it typically starts with a certain number of core threads. These core threads are kept alive and ready to execute tasks as soon as they become available in the task queue.

Thread Pool Growth: If the number of tasks submitted to the thread pool exceeds the number of core threads and there are still tasks waiting in the queue, the thread pool may create additional threads, up to the maximum pool size (if specified). These additional threads are created to handle the increased workload and are known as "non-core" or "extra" threads.

Idle Threads: If there are no tasks to execute and the number of active threads exceeds the core pool size, excess threads (those beyond the core pool size) may be terminated to conserve resources. However, the core threads are kept alive even when idle, ready to handle new tasks without the overhead of thread creation.

Usage: The core pool size is typically set based on the expected concurrency level of your application and the available resources. It determines the minimum number of threads that are always available to handle incoming tasks. Setting an appropriate core pool size helps balance resource utilization and responsiveness in the thread pool.

In the context of the ThreadPoolTaskExecutor in Spring, the corePoolSize property specifies the initial number of threads in the thread pool. These threads are created when the thread pool is initialized and remain active unless explicitly terminated or if the thread pool implementation decides to scale the number of threads dynamically based on workload and configuration parameters. Adjusting the core pool size allows you to control the concurrency level and resource usage of the thread pool in your application.

#### Max Pool Size

The "max pool size" refers to the maximum number of threads that can exist simultaneously in a thread pool. When the number of threads in the pool reaches the maximum pool size, the pool will stop creating new threads, even if there are pending tasks in the task queue.

Here's a more detailed explanation:

Thread Pool Growth: When a task is submitted to a thread pool and there are fewer than the maximum pool size threads actively executing tasks, the thread pool may create new threads to handle the workload. These threads are created dynamically as needed until the maximum pool size is reached.

Capacity Limit: The max pool size sets an upper limit on the number of threads that can exist in the pool at any given time. Once this limit is reached, the thread pool will not create any additional threads, even if there are more tasks waiting in the task queue.

Resource Management: Setting an appropriate max pool size helps balance resource utilization and prevents resource exhaustion. It ensures that the thread pool does not create an excessive number of threads, which could lead to increased memory consumption, contention, or performance degradation.

Scalability: The max pool size can be adjusted based on the expected workload and available system resources. Increasing the max pool size allows the thread pool to handle a higher concurrency level and process more tasks concurrently, while reducing it conserves resources and prevents overloading the system.

In the context of the ThreadPoolTaskExecutor in Spring:

The maxPoolSize property specifies the maximum number of threads that can be active in the thread pool simultaneously.
When configuring a ThreadPoolTaskExecutor, you can set the maxPoolSize to control the scalability and resource usage of the thread pool based on your application's requirements and the available resources in your environment.

#### Queue Capacity

The queueCapacity property in Spring's ThreadPoolTaskExecutor configuration specifies the maximum number of tasks that can be queued for execution when all threads in the thread pool are busy.

Here's a more detailed explanation:

Task Queue: When a task is submitted to a thread pool and all the threads in the pool are busy executing other tasks, the new task is placed in a task queue. The task queue holds tasks that are waiting to be executed once a thread becomes available.

Queue Capacity: The queueCapacity property sets the maximum size of the task queue. If the number of pending tasks exceeds the queue capacity, additional tasks may be rejected or handled based on the configured rejection policy.

Backpressure Handling: The task queue helps manage backpressure by temporarily buffering incoming tasks when the thread pool is overloaded. This allows the thread pool to maintain a steady flow of tasks and prevents resource exhaustion or overload conditions.

Resource Management: Setting an appropriate queue capacity helps balance resource utilization and responsiveness in the thread pool. A larger queue capacity can help accommodate bursts of activity or spikes in workload, while a smaller queue capacity can prevent excessive memory usage and mitigate the risk of unbounded queue growth.

Rejection Policies: If the task queue reaches its capacity and cannot accept any more tasks, you can configure a rejection policy to handle the overflow of tasks. Spring provides several built-in rejection policies, such as abort, discard, discard oldest, and caller runs, which determine how the thread pool should handle rejected tasks.

In the context of the ThreadPoolTaskExecutor in Spring:

The queueCapacity property specifies the maximum size of the task queue.
When configuring a ThreadPoolTaskExecutor, you can set the queueCapacity to control the buffering of tasks and manage backpressure based on your application's requirements and the expected workload characteristics.

```java
executor.setQueueCapacity(100); // Set the queue capacity to 100 tasks
```

#### What If there are more than 100 tasks ?

If the number of pending tasks exceeds the queueCapacity specified in the ThreadPoolTaskExecutor configuration, the behavior depends on the rejection policy configured for the thread pool.

Spring provides several built-in rejection policies to handle the overflow of tasks in the task queue:

Abort Policy: The default rejection policy. When the task queue reaches its capacity and cannot accept any more tasks, a RejectedExecutionException is thrown, indicating that the task submission has been rejected.

Discard Policy: When the task queue reaches its capacity, new tasks submitted to the thread pool are silently discarded without any error or notification. This policy discards the rejected tasks and may result in loss of data or work.

Discard Oldest Policy: When the task queue reaches its capacity, the oldest task in the queue (i.e., the task that has been waiting in the queue for the longest time) is removed from the queue to make space for the new task. This policy ensures that the newest tasks have priority over older tasks.

Caller Runs Policy: When the task queue reaches its capacity, the thread that submits the new task to the thread pool executes the task itself. This policy offloads the task execution to the caller thread, allowing the caller to handle the task execution directly.

You can configure the rejection policy using the setRejectedExecutionHandler() method of ThreadPoolTaskExecutor. 

#### Does that mean I can loose tasks ?

Yes, depending on the rejection policy configured for the ThreadPoolTaskExecutor, it's possible to lose tasks if the task queue reaches its capacity and cannot accept any more tasks.

In particular, if you're using the "Discard" or "Discard Oldest" rejection policies, newly submitted tasks are discarded when the task queue is full, without any error or notification. This means that tasks that cannot be accommodated due to queue overflow will be silently dropped, potentially leading to data loss or incomplete processing.

Even with other rejection policies like "Abort" or "Caller Runs", tasks may not be executed if the rejection policy cannot accommodate them. For example, with the "Abort" policy, a RejectedExecutionException is thrown, indicating that the task submission has been rejected.

Therefore, it's important to carefully consider the behavior of the rejection policy and choose an appropriate strategy based on your application's requirements and the impact of potential task loss. If task loss is unacceptable, you may need to implement a custom rejection policy or handle rejected tasks in a way that ensures they are not lost, such as logging them for later processing or retrying them at a later time.

