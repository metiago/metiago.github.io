---
title: 'Jenkins Job Periodically'
date: "2016-04-16"
draft: false
image: "https://placehold.co/600x400"
---

In order to run a Jenkins Job periodically, all you need to do is reaching your Job Configuration and move to the Build Triggers section. There you need to check the option Build Periodically and specify a cron expression for your jenkins Job:

![Jenkins Pipeline](/images/ci/jobs-periodically.png)

In the above example, we have used the cron expression “*/1 * * * *” which means to run the Jenkins job every minute.

The format used in the Schedule field is as follows:

**MINUTE (0-59), HOUR (0-23), DAY (1-31), MONTH (1-12), DAY OF THE WEEK (0-6)**

#### Examples:

- Start build daily at 08:30 in the morning Monday – Friday: 30
    - 08 * * 1-5
- Weekday daily build twice a day, at lunchtime 12:00 and midnight 00:00, Sunday to Thursday
    - 00 0,12 * * 0-4
- Start build at midnight: @midnight or start build at midnight, every Saturday
    - 59 23 * * 6
- Every first of every month between 2:00 a.m. – 02:30 a.m
    - H(0,30) 02 01 * *
