---
title:  'Jenkins REST API'
date: 2017-02-12T19:18:41-03:00
draft: false
---

This is an example of, how we can use the REST API to manage Jenkins Jobs remotely.

Many objects of Jenkins provide the remote access API. They are available at `/…/api/` where `"…"` portion is the object for which you’d like to access.

The simplest way to access Jenkins REST API is to gather the User Token which is available by selecting your User and clicking on Configure.

If you are running Jenkins on localhost:8080 with user ‘jenkins’ the link to access your User’s configuration is:

```bash
http://localhost:8080/user/jenkins/configure
```

From there, browse to the API Token Section and click on the Show API Token button:

<img src="/site/images/jenkins/api-token/api-token.png" width="auto"/>

Now you will use the token as parameter for your authentication. Some examples:

If your user is ‘jenkins’ and the token is ‘f1499cc9852c899d327a1f644e61a64d’ here is how you can start the job ‘job1’ using Jenkins REST Api:

```bash
curl -X POST http://localhost:8080/job/job1/build --user jenkins:f1499cc9852c899d327a1f644e61a64d
```

You can also schedule the job start-up with some delay:

```bash
curl -X POST http://localhost:8080/job/job1/build?delay=10sec  --user jenkins:f1499cc9852c899d327a1f644e61a64d
```

What if you need to build a job with Parameters?


```bash
curl -X POST http://localhost:8080/job/job1/build  \
  -jenkins:f1499cc9852c899d327a1f644e61a64d \
  --data-urlencode json='{"parameter": [{"name":"id", "value":"100"}, {"name":"loglevel", "value":"high"}]}'
  ```

If you want to delete the job ‘job1’ then you can do it using the doDelete method:

```bash
curl -X POST http://localhost:8080/job/job1/doDelete --user jenkins:f1499cc9852c899d327a1f644e61a64d
```

If you want a list of all jobs (with a nicely formatted JSON), then you can invoke the /api/json API with a simple GET request:

```bash
curl -X GET http://localhost:8080/api/json?pretty=true --user jenkins:f1499cc9852c899d327a1f644e61a64d
```

If you want to know more about it, Jenkins has a link to their REST API in the bottom right of each page. This link appears on every page of Jenkins and points you to an API output for the exact page you are browsing. That should provide some understanding into how to build the API URls.
