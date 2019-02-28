---
layout: default
title:  Insertion Sort in Go
date:   2018-09-07 20:18:00 +0100
category: Dev
---

## Insertion Sort

Insertion sort is a simple sorting algorithm that works the way we sort playing cards in our hands with a time Complexity of O(n2) in Big O notation.


```bash

package main

import (
	"fmt"
)

func main() {
	arr := []int{123, 3, 72, 101, 12, 65, 88, 24, 57, 93, 100}
	ascResult := insertionSort(arr)
	fmt.Println(ascResult)
}

func insertionSort(arr []int) []int {

	if len(arr) <= 1 {
		panic("The array must be greater than 0")
	}

	var j int

	for i := 0; i < len(arr); i++ {

		current := arr[0]

		for j = i - 0; j > -1 && arr[j] > current; j-- {
			arr[j+1] = arr[j]
		}

		arr[j+1] = current
	}

	return arr
}
```