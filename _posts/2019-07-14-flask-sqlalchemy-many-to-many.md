---
layout: default
title:  Flask Framework - SQLAlchemy Many To Many Relationship
date:   2019-07-14 20:18:00 +0100
category: Dev
---

## Flask Framework - SQLAlchemy Many To Many Relationship

Today, I'm going to share an example of how to implement a many to many relationship using SQLAlchemy ORM.


## Example

This example simulate a relationship like, many people have many chat histories.

```python

class PersonChat(db.Model):
    __tablename__ = "person_chat_history"
    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.Integer)
    chat_history_id = db.Column(db.Integer)


class Person(db.Model):
  
  __tablename__ = 'person'
  
  id = Column(Integer, primary_key=True)
  first_name = Column(String(100), nullable=False)
  last_name = Column(String(100), nullable=False)


class ChatHistory(db.Model):

    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True)
    message = Column(String(255), nullable=False)
    date_sent = Column(DateTime(), nullable=False)

    person = relationship(
        "Person",
        secondary="person_chat",
        primaryjoin="PersonChat.chat_id==ChatHistory.id",
        secondaryjoin="PersonChat.person_id==Person.id",
        lazy="noload",
    )
```