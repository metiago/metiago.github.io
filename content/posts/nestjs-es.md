---
title: 'Nest JS Event Sourcing'
date: 2019-03-27T21:17:20-03:00
draft: true
---

```bash
npm install -g @nestjs/cli
```

```bash
nest new event-sourcing-example
```

Define Events:

```ts
// src/events/user.events.ts

export class UserCreatedEvent {
    constructor(public readonly userId: string, public readonly name: string, public readonly email: string) {}
}

export class UserNameUpdatedEvent {
    constructor(public readonly userId: string, public readonly newName: string) {}
}
```

Create an Event Store:

```ts
// src/events/event-store.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class EventStoreService {
    private readonly events: any[] = [];

    storeEvent(event: any) {
        this.events.push(event);
    }

    getEvents(): any[] {
        return this.events;
    }
}
```

Aggregate Root:

```ts
// src/users/user.aggregate.ts

import { Injectable } from '@nestjs/common';
import { UserCreatedEvent, UserNameUpdatedEvent } from '../events/user.events';
import { EventStoreService } from '../events/event-store.service';

@Injectable()
export class UserAggregate {
    constructor(private readonly eventStore: EventStoreService) {}

    createUser(userId: string, name: string, email: string) {
        const event = new UserCreatedEvent(userId, name, email);
        this.eventStore.storeEvent(event);
    }

    updateUserName(userId: string, newName: string) {
        const event = new UserNameUpdatedEvent(userId, newName);
        this.eventStore.storeEvent(event);
    }
}
```
Command Handlers:


```ts
// src/users/user.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { UserAggregate } from './user.aggregate';

@Controller('users')
export class UserController {
    constructor(private readonly userAggregate: UserAggregate) {}

    @Post()
    createUser(@Body() createUserDto: any) {
        this.userAggregate.createUser(createUserDto.userId, createUserDto.name, createUserDto.email);
    }

    @Post(':userId/name')
    updateUserName(@Body() updateUserNameDto: any) {
        this.userAggregate.updateUserName(updateUserNameDto.userId, updateUserNameDto.newName);
    }
}

```

Subscribe Event Handlers:

```ts
// src/users/user.event-handler.ts

// user.event-handler.ts

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent, UserNameUpdatedEvent, UserDeletedEvent } from './user.events';
import { UserProjection } from './user.projection';

@Injectable()
@EventsHandler(UserCreatedEvent, UserNameUpdatedEvent, UserDeletedEvent)
export class UserEventHandler implements IEventHandler<UserCreatedEvent | UserNameUpdatedEvent | UserDeletedEvent> {
    constructor(private readonly userProjection: UserProjection) {}

    handle(event: UserCreatedEvent | UserNameUpdatedEvent | UserDeletedEvent) {
        if (event instanceof UserCreatedEvent) {
            this.userProjection.handleUserCreatedEvent(event);
        } else if (event instanceof UserNameUpdatedEvent) {
            this.userProjection.handleUserNameUpdatedEvent(event);
        } else if (event instanceof UserDeletedEvent) {
            this.userProjection.handleUserDeletedEvent(event);
        }
    }
}

```


```ts
// user.projection.ts

import { Injectable } from '@nestjs/common';
import { UserCreatedEvent, UserNameUpdatedEvent, UserDeletedEvent } from './user.events';

@Injectable()
export class UserProjection {
    private readonly users: Record<string, { name: string; email: string }> = {};

    handleUserCreatedEvent(event: UserCreatedEvent) {
        this.users[event.userId] = { name: event.name, email: event.email };
    }

    handleUserNameUpdatedEvent(event: UserNameUpdatedEvent) {
        if (this.users[event.userId]) {
            this.users[event.userId].name = event.newName;
        }
    }

    handleUserDeletedEvent(event: UserDeletedEvent) {
        delete this.users[event.userId];
    }

    getUser(userId: string) {
        return this.users[userId];
    }

    getAllUsers() {
        return Object.values(this.users);
    }
}
```


```ts
// src/users/user.module.ts

import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserAggregate } from './user.aggregate';
import { EventStoreService } from '../events/event-store.service';
import { UserEventHandler } from './user.event-handler';

@Module({
    controllers: [UserController],
    providers: [UserAggregate, EventStoreService, UserEventHandler],
})
export class UserModule {}
```