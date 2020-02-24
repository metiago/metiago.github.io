---
layout: default
title:  Golang - CSV reader and writter
date:   2019-08-12 20:18:00 +0100
category: Dev
---

## Golang - CSV reader and writter

Below there is a simple example of how to write and read to/from CSV file using Golang.

## Example

```go
package main

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
)

type Animal struct {
	Id     int
	Name   string
	Specie string
}

const CSV_FILE_NAME = "animals.csv"

func main() {

	csvFile, err := os.Create(CSV_FILE_NAME)
	if err != nil {
		panic(err)
	}
	defer csvFile.Close()

	allAnimals := []Animal{
		Animal{Id: 1, Name: "African Elephant", Specie: "Loxodonta africana"},
		Animal{Id: 2, Name: "African Wild Dog", Specie: "Lycaon pictus"},
		Animal{Id: 3, Name: "Albacore Tuna", Specie: "Thunnus alalunga"},
		Animal{Id: 4, Name: "Amur Leopard", Specie: "Panthera pardus orientalis"},
	}

	writer := csv.NewWriter(csvFile)
	for _, animal := range allAnimals {
		line := []string{strconv.Itoa(animal.Id), animal.Name, animal.Specie}
		err := writer.Write(line)
		if err != nil {
			panic(err)
		}
	}
	writer.Flush()

	file, err := os.Open(CSV_FILE_NAME)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1
	record, err := reader.ReadAll()

	if err != nil {
		panic(err)
	}

	var animals []Animal

	for _, item := range record {
		id, _ := strconv.ParseInt(item[0], 0, 0)
		animal := Animal{Id: int(id), Name: item[1], Specie: item[2]}
		animals = append(animals, animal)
	}

	fmt.Println(animals[0].Id)
	fmt.Println(animals[0].Name)
	fmt.Println(animals[0].Specie)
}

```