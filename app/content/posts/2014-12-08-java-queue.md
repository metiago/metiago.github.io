---
title:  'Queues'
date: "2014-07-03"
draft: false
image: "https://images.pexels.com/photos/716661/pexels-photo-716661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
---

A Queue is a linear structure which follows a particular order in which the operations are performed. The order is First In First Out (FIFO).

```java

public class Queue {

    private static class Node {
        private int data;
        private Node next;

        private Node(int data) {
            this.data = data;
        }
    }

    private Node head;

    private Node tail;

    public boolean isEmpty() {
        return head == null;
    }

    public int peek() {
        return head.data;
    }

    public void add(int data) {
        Node node = new Node(data);
        if (tail != null) {
            tail.next = node;
        }
        tail = node;
        if (head == null) {
            head = node;
        }
    }

    public int remove() {
        int data = head.data;
        head = head.next;
        if (head == null) {
            tail = null;
        }
        return data;
    }

}

 class QueueTest {

     public static void main(String[] args) {
         Queue queue = new Queue();
         queue.add(3);
         queue.add(2);
         queue.add(5);
         System.out.println(queue.peek());
         queue.remove();
         System.out.println(queue.peek());
         queue.remove();
         System.out.println(queue.peek());
     }

}
```
