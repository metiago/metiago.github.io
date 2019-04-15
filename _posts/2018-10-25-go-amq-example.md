---
layout: default
title:  Stomp Protocol Golang
date:   2018-10-25 20:18:00 +0100
category: Dev
---

## Stomp protocol implementation using Golang

STOMP is the Simple (or Streaming) Text Orientated Messaging Protocol.

STOMP provides an interoperable wire format so that STOMP clients can communicate with any STOMP message broker to provide easy and widespread messaging interoperability among many languages, platforms and brokers.

To test these examples it necessary to run on of the brokers weach implement the stomp protocol (Apache MQ, Rabbit MQ).

producer.go

```go

package main

import (
	"fmt"
	"github.com/go-stomp/stomp"
	"time"
)

func main() {
    
    fmt.Println("Running...")
	
    conn, err := stomp.Dial("tcp", "172.17.0.2:61613")
	if err != nil {
		panic(err)
	}

	for {
	err = conn.Send(
		"/queue/test-1",           // destination
		"text/plain",              // content-type
		[]byte("Test message #1")) // body
	if err != nil {
		panic(err)
	}
	time.Sleep(5 * time.Second)
}
	conn.Disconnect()
}

```

consumer.go

```go

package main

import (
	"fmt"
	"github.com/go-stomp/stomp"
	"time"
)

func main() {
	fmt.Println("Consuming....")
	c, err := stomp.Dial("tcp", "172.17.0.2:61613")
	sub, err := c.Subscribe("/queue/test-1", stomp.AckAuto)
	if err != nil {
		panic(err)
	}
	// receive 5 messages and then quit
	for  {
		msg := <-sub.C
		if msg.Err != nil {
			panic(err)
		}

		// acknowledge the message
		err = c.Ack(msg)
		if err != nil {
			panic(err)
		}

		fmt.Println(string(msg.Body))
	}

	err = sub.Unsubscribe()
	if err != nil {
		panic(err)
	}
	time.Sleep(60)
	c.Disconnect()
}

```