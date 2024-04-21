package org.acme;

import java.util.concurrent.*;

public class SumTask extends RecursiveTask<Integer> {

    private static final int THRESHOLD = 10; // Threshold for splitting the task
    private int[] array;
    private int start;
    private int end;

    public SumTask(int[] array, int start, int end) {
        this.array = array;
        this.start = start;
        this.end = end;
    }

    @Override
    protected Integer compute() {
        if (end - start <= THRESHOLD) {
            // Compute the sum directly if the range is small enough
            int sum = 0;
            for (int i = start; i < end; i++) {
                sum += array[i];
            }
            return sum;
        } 
        else {
            // Split the task into subtasks
            int mid = (start + end) / 2;
            SumTask leftTask = new SumTask(array, start, mid);
            SumTask rightTask = new SumTask(array, mid, end);

            // Fork the subtasks
            leftTask.fork();
            rightTask.fork();

            // Join the results of subtasks
            int leftResult = leftTask.join();
            int rightResult = rightTask.join();

            // Combine the results
            return leftResult + rightResult;
        }
    }

    public static void main(String[] args) {
        int[] array = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

        // Create a ForkJoinPool
        ForkJoinPool forkJoinPool = ForkJoinPool.commonPool();

        // Create a task for the entire array
        SumTask task = new SumTask(array, 0, array.length);

        // Submit the task to the pool
        int result = forkJoinPool.invoke(task);

        // Print the result
        System.out.println("Sum: " + result);

        // Shutdown the pool
        forkJoinPool.shutdown();
    }
}
