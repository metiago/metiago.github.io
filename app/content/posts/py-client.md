---
title: 'Python Rabbit API'
date: "2014-07-03"
draft: false
---

Code snippet demonstrates how to publish messages to a RabbitMQ exchange using the `pika` library. It establishes a connection to a RabbitMQ server running on `localhost`, declares a fanout exchange named `x-tracking-sale-delivery`, and sends a JSON-encoded message containing tracking information in a loop, with a 2-second delay between each message. The messages include custom headers for authorization and content type. Finally, the connection to RabbitMQ is closed after all messages are sent. The code can be enhanced with error handling and logging for better robustness and maintainability.

```python
import json
from time import sleep
import pika

TRACKING = {"title": "Hello!"}

HOST = "localhost"

credentials = pika.PlainCredentials("username", "password")
connection_params = pika.ConnectionParameters(HOST, 5672, "/", credentials)

connection = pika.BlockingConnection(connection_params)
channel = connection.channel()

exchange_name = "x-tracking-sale-delivery"

headers = {"Authorization": "xyz123", "Content-Type": "application/json"}

properties = pika.BasicProperties(headers=headers)

channel.exchange_declare(exchange=exchange_name, exchange_type="fanout", durable=True)
for _ in range(10):
    channel.basic_publish(
        exchange=exchange_name, routing_key="", body=json.dumps(TRACKING), properties=properties
    )
    print(f" [x] Message Sent'")
    sleep(2)

connection.close()
```