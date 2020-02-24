---
layout: default
title:  Golang - Binary reader and writter
date:   2019-08-13 20:18:00 +0100
category: Dev
---

## Golang - Binary reader and writter

The encoding/gob package manages streams of gobs, which are binary data,
exchanged between an encoder and a decoder. It’s designed for serialization and
transporting data but it can also be used for persisting data. Encoders and decoders
wrap around writers and readers, which conveniently allows you to use them to write
to and read from files. The following listing demonstrates how you can use the gob
package to create binary data files and read from them.

## Example

```go
package main

import (
	"bytes"
	"encoding/gob"
	"fmt"
	"io/ioutil"
)

type Post struct {
	Id      int
	Content string
	Author  string
}

func store(data interface{}, filename string) {
	buffer := new(bytes.Buffer)
	encoder := gob.NewEncoder(buffer)
	err := encoder.Encode(data)
	if err != nil {
		panic(err)
	}
	err = ioutil.WriteFile(filename, buffer.Bytes(), 0600)
	if err != nil {
		panic(err)
	}
}
func load(data interface{}, filename string) {
	raw, err := ioutil.ReadFile(filename)
	if err != nil {
		panic(err)
	}
	buffer := bytes.NewBuffer(raw)
	dec := gob.NewDecoder(buffer)
	err = dec.Decode(data)
	if err != nil {
		panic(err)
	}
}

func main() {
	post := Post{Id: 1, Content: "Hello World!", Author: "Sau Sheong"}
	store(post, "post1")
	var postRead Post
	load(&postRead, "post1")
	fmt.Println(postRead)
}

```