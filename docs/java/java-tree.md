---
title:  'Tree'
date: 2010-02-02T19:18:41-03:00
draft: false
---

A tree data structure can be defined recursively as a collection of nodes (starting at a root node), where each node is a data structure consisting of a value, together with a list of references to nodes (the "children"), with the constraints that no reference is duplicated, and none points to the root.

```java

public class Node {

	private int data;

	private Node left, right;

	public Node(int data) {
		
		this.data = data;
	}

	public void insert(int value) {

		if (value <= data) {

			if (left == null) {
				left = new Node(value);
			} else {
				left.insert(value);
			}

		} else {

			if (right == null) {
				right = new Node(value);
			} else {
				right.insert(value);
			}
		}
	}

	public boolean contains(int value) {

		if (value == data) {
			return true;
		} 
		else if (value < data) {

			if (left == null) {
				return false;
			} else {
				return left.contains(value);
			}
			
		} 
		else {

			if (right == null) {
				return false;
			} else {
				return right.contains(value);
			}

		}
	}
	
	public void print() {
		
		if(left != null) {
			left.print();
		}
		
		System.out.println(data);
		
		if(right != null) {
			right.print();
		}
	}

}

class TreeTest {

	public static void main(String[] args) {
		
		Node node = new Node(10);
		System.out.println(node.contains(4));
		node.print();
		
	}

}
```
