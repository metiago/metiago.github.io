---
title: 'Stacks'
date: "2015-06-08"
draft: false
image: "https://placehold.co/600x400"
---

Stack is a data structure which follows a particular order in which the operations are performed. The order may be LIFO(Last In First Out) or FILO(First In Last Out).

```java

public class Stack {

    private static class Node {
        private int data;
        private Node next;

        private Node(int data) {
            this.data = data;
        }
    }

    private Node top;

    public boolean isEmpty() {
        return top == null;
    }

    public int peek() {
        return top.data;
    }

    public void push(int data) {
        Node node = new Node(data);
        node.next = top;
        top = node;
    }

    public int pop() {
        int data = top.data;
        top = top.next;
        return data;
    }

}

 class StackTest {

     public static void main(String[] args) {
         Stack stack = new Stack();
         stack.push(3);
         stack.push(2);
         stack.push(5);
         System.out.println(stack.peek());
         stack.pop();
         System.out.println(stack.peek());
         stack.pop();
         System.out.println(stack.peek());
     }

}

```
