---
layout: default
title:  Apache Cassandra Golang
date:   2018-02-12 20:18:00 +0100
category: Dev
---

## Example Apache Cassandra Golang

Below there is a simple example of how to use Golang to connect to apache cassandra database and perform some basic operation. These steps are
commom ones to get into more advanced command operations.

After get you apache cassandra up and running, it's necessary to create a keyspace as well as a table for testing. Connect to the database using cqlsh
and execute the following

```sql
-- Create a key space
create keyspace example with replication = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };
-- Create table
create table example.tweet(timeline text, id UUID, text text, PRIMARY KEY(id));
-- Create an index
create index on example.tweet(timeline);
```

```go

package main

import (
	"fmt"
	"log"

	"github.com/gocql/gocql"
)

func main() {
	
	cluster := gocql.NewCluster("192.168.1.1", "192.168.1.2", "192.168.1.3")
	cluster.Keyspace = "example"
	cluster.Consistency = gocql.Quorum
	session, _ := cluster.CreateSession()
	defer session.Close()

	if err := session.Query(`INSERT INTO tweet (timeline, id, text) VALUES (?, ?, ?)`, "me", gocql.TimeUUID(), "hello world").Exec(); err != nil {
		log.Fatal(err)
	}

	var id gocql.UUID
	var text string

	/* Search for a specific set of records whose 'timeline' column matches
	 * the value 'me'. The secondary index that we created earlier will be
	 * used for optimizing the search */
	if err := session.Query(`SELECT id, text FROM tweet WHERE timeline = ? LIMIT 1`, "me").Consistency(gocql.One).Scan(&id, &text); err != nil {
		log.Fatal(err)
	}
	fmt.Println("Tweet:", id, text)

	// list all tweets
	iter := session.Query(`SELECT id, text FROM tweet WHERE timeline = ?`, "me").Iter()
	for iter.Scan(&id, &text) {
		fmt.Println("Tweet:", id, text)
	}
	if err := iter.Close(); err != nil {
		log.Fatal(err)
	}
}

```