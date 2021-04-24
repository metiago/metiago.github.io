---
layout: post
title:  Java Design Pattern - Command
date:   2018-11-21 20:18:00 +0100
category: Dev
tags: algorithm datastructure design
---

## Command Design Pattern

#### Concept

Here requests are encapsulated as objects. In general, four terms are associated—invoker, client, command,
and receiver. A command object is capable of calling a particular method in the receiver. It stores the
parameters of the methods in receiver. An invoker only knows about the command interface, but it is
totally unware about the concrete commands. The client object holds the invoker object and the command
object(s). The client decides which of these commands needs to execute at a particular point in time. To do
that, he/she passes the command object to the invoker to execute that particular command.

#### Example

The above scenario applies with Microsoft paint also. There we can do the undo/redo operations easily
through some menu options or shortcut keys.


```java
public interface ICommand {
    void Do();
}
```

```java
public class Invoke {

    ICommand cmd;

    public void ExecuteCommand(ICommand cmd) {
        this.cmd = cmd;
        cmd.Do();
    }
}
```

```java
public class MyRedoCommand implements ICommand {

    private Receiver receiver;

    MyRedoCommand(Receiver recv) {
        receiver = recv;
    }

    @Override
    public void Do() {
        receiver.performRedo();
    }
}
```

```java
public class MyUndoCommand implements ICommand {

    private Receiver receiver;

    MyUndoCommand(Receiver recv) {
        receiver = recv;
    }

    @Override
    public void Do() {
        receiver.performUndo();
    }
}
```

```java
public class Receiver {

    public void performUndo() {
        System.out.println("Executing -MyUndoCommand");
    }

    public void performRedo() {
        System.out.println("Executing -MyRedoCommand");
    }
}
```

```java
public class CommandPatternEx {

    public static void main(String[] args) {

        Receiver receiver = new Receiver();

        Invoke inv = new Invoke();
        MyUndoCommand unCmd = new MyUndoCommand(receiver);
        MyRedoCommand reCmd = new MyRedoCommand(receiver);
        inv.ExecuteCommand(unCmd);
        inv.ExecuteCommand(reCmd);
    }
}
```

Note
1. This pattern is widely used for undo/redo operations.
2. A callback function can be designed with this pattern.
3. This pattern is very useful when we model transactions (which can be
responsible for changes in data).
4. Commands can be extended easily. They operate like any other objects. And the
beauty of using them is that while we use them, we do not need to change the
classes in the system.
5. There is another pattern called chain of responsibility. There we forward a request
along a chain of objects with the hope that any one of the objects along that chain
will handle the request. But in command pattern, we’ll forward the request to the
specific object