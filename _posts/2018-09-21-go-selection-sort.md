---
layout: default
title:  Selection Sort in Go
date:   2018-09-21 20:18:00 +0100
category: Dev
---

## Selection Sort

The selection sort algorithm sorts an array by repeatedly finding the minimum element (considering ascending order) from unsorted part and putting it at the beginning. The algorithm maintains two subarrays in a given array.


```java

package main

import (
	"fmt"
)

// Time Complexity: O(n2)
func main() {
	arr := []int{99, 1, 77, 12, 55, 88, 23, 11, 7, 3, 2}
	ascResult := selectionSort(arr)
	fmt.Println(ascResult)
}

func selectionSort(arr []int) []int {

	if len(arr) <= 1 {
		panic("The array must be greater than 0")
	}

	for i := 0; i < len(arr)-1; i++ {
		min := i
		for j := i + 1; j < len(arr); j++ {
			if arr[j] < arr[min] {
				min = j
			}
		}

		if i != min {
			swap := arr[i]
			arr[i] = arr[min]
			arr[min] = swap
		}
	}

	return arr
}
```