---
layout: default
title:  Binary Searching in Go
date:   2018-07-16 20:18:00 +0100
category: Dev
---

## Binary Search

Binary search, is a search algorithm that finds the position of a target value within a sorted array. Binary search has a time complexity of O(log n) in Big O notation.

```java

package main

import (
	"fmt"
	"math"
)

func main() {
	arr := []int{1001, 2002, 3003, 4004, 5005, 6006, 7007, 8008, 9009}
	res := binarySearch(arr, 5005)
	fmt.Println(res)
}

func binarySearch(arr []int, elem int) int {
	lowIndex := 0
	highIndex := len(arr)
	for i := 0; i < len(arr); i++ {
		middleIndex := int(math.Floor(float64((lowIndex + highIndex) / 2)))
		if arr[middleIndex] == elem {
			return middleIndex
		} else if elem > arr[middleIndex] {
			lowIndex = middleIndex
		} else {
			highIndex = middleIndex
		}
	}
	return -1
}
```