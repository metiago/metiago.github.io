---
layout: default
title:  Quick Sort in Go
date:   2018-09-11 20:18:00 +0100
category: Dev
---

## Quick Sort

QuickSort is a divide and conquer algorithm. It picks an element as pivot and partitions the given array around the picked pivot. There are many different versions of quickSort that pick pivot in different ways. This algorithm has a time complexy of O(nlog2(n)) on average and O(n2) for worst case.


```java

package main

import (
	"fmt"
	"math"
)

func main() {
	arr := []int{99, 1, 77, 12, 55, 88, 23, 11, 7, 3, 2}
	ascResult := quickSort(arr, 0, len(arr)-1)
	fmt.Println(ascResult)
}

func quickSort(arr []int, left int, right int) []int {

	var index int

	if len(arr)-1 > 1 {

		index = partitions(arr, left, right)

		if left < index-1 {
			quickSort(arr, left, index-1)
		}
	}

	if index < right {
		quickSort(arr, index, right)
	}

	return arr
}

func partitions(arr []int, left int, right int) int {

	pivot := int(math.Floor(float64((right + left) / 2)))

	for left <= right {

		for pivot > arr[left] {
			left++
		}

		for pivot < arr[right] {
			right--
		}

		if left <= right {
			temp := arr[left]
			arr[left] = arr[right]
			arr[right] = temp
			left++
			right--
		}
	}

	return left
}
```