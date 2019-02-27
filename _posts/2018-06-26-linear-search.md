---
layout: post
title:  Linear Searching in Go
date:   2018-06-26 20:18:00 +0100
category: Dev
---

## Linear Search

Linear search a method for finding an element within a list. It sequentially checks each element of the list until a match is found or the whole list has been searched.

```bash

package main

import (
	"fmt"
)

// Time Complexity: O(n)
func main() {
	arr := []int{2002, 4004, 3003, 5005, 1001, 6006, 7007}
	res := hasElemInArray(arr, 3003)
	fmt.Println(res)
}

// Check if a given element is in a given array
func hasElemInArray(arr []int, elem int) bool {
	for i := 0; i < len(arr); i++ {
		if elem == arr[i] {
			return true
		}
	}
	return false
}

// Find the minor value in a given array
func findMinorValue(actuals []int) int {
	minor := 0
	for i := 0; i < len(actuals); i++ {
		if actuals[i] < actuals[minor] {
			minor = i
		}
	}
	return actuals[minor]
}
```