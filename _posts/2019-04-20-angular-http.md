---
layout: default
title:  Angular - HTTP Request Examples
date:   2019-04-20 20:18:00 +0100
category: Dev
---

## Angular - HTTP GET Request Examples
Below is a quick set of examples to show how to send HTTP requests from Angular to a backend API.

#### Prerequisites for making HTTP request from Angular
Before making HTTP requests from your Angular app you need to import HttpClientModule in your AppModule class.

```javascript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

#### GET request with strongly typed response

```javascript
export class Post {
    title: string;
    content: string;
    author: string;
}

this.http.get<Posts[]>('https://mybackendapi.com/v2/search?q=javascriptscript').subscribe(
    data => this.posts = data,
    error => console.error('There was an error!', error)
)
```

#### GET request with a generic response type
```javascript
this.http.get<any>('https://mybackendapi.com/v2/search?q=javascriptscript').subscribe(data => {
    this.posts = data.content;
})
```

#### POST request 
```javascript
this.http.post<Post>(`${config.API_URL}/posts`, JSON.stringify(post)).subscribe(() => console.log("ok"));
```

#### PUT request 

```javascript
this.http.put<Post>(`${config.API_URL}/posts`, JSON.stringify(post)).subscribe(() => console.log("ok"));
```

#### DELETE request
```javascript
this.http.delete<Post>(`${this.API_URL}/${key}`).subscribe(() => console.log("ok"));
```



