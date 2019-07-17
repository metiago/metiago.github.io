---
layout: default
title:  Bubble Sort in Go
date:   2018-08-27 20:18:00 +0100
category: Dev
---

## Bubble Sort

Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in wrong order. This algorithm has a time complexity of O(n2)

```java

package main

import (
	"fmt"
)

func main() {
	arr := []int{123, 3, 72, 12, 65, 88, 24, 57, 93, 101}
	ascResult := bubbleSortOrderAsc(arr)
	fmt.Println(ascResult)
	descResult := bubbleSortOrderDesc(arr)
	fmt.Println(descResult)
}

func bubbleSortOrderAsc(arr []int) []int {

	if len(arr) <= 1 {
		panic("The array must be greater than 0")
	}

	var flag = true
	var swap int

	for flag {

		flag = false

		for i := 0; i < len(arr)-1; i++ {

			if arr[i+1] < arr[i] {
				swap = arr[i]
				arr[i] = arr[i+1]
				arr[i+1] = swap
				flag = true
			}
		}
	}

	return arr
}

func bubbleSortOrderDesc(arr []int) []int {

	if len(arr) <= 1 {
		panic("The array must be greater than 0")
	}

	var flag = true
	var temp int

	for flag {

		flag = false

		for i := 0; i < len(arr)-1; i++ {

			if arr[i] < arr[i+1] {
				temp = arr[i]
				arr[i] = arr[i+1]
				arr[i+1] = temp
				flag = true
			}
		}
	}

	return arr
}
```