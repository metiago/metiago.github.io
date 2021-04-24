---
layout: post
title: Java - Apache Camel XML
date: 2017-02-12 20:18:00 +0100
category: Dev
tags: apache camel java
---

## What is Camel ?

I wrote a brief introduction about Apache Camel in this [post](2017-02-08-java-apache-camel.md)

## XML Example

When working with heterogeneous systems sometimes we need to integrate them using an XML file.

Today we are going to implement a simple how-to, using Camel XML features to read a XML file from one directory and save it in another one.

Save this XML below as `animal.xml` in a directory called `data/inbox` in the root folder of your Java project. This XML represents a list of
animals with some metadata.
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<animals>
    <animal>
        <id>8</id>
        <scientificName>Spheniscus mendiculus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-07-28T17:48:00.618-03:00</created>
        <age>23</age>
    </animal>
    <animal>
        <id>4</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-07-08T14:35:20.362-03:00</created>
        <age>17</age>
    </animal>
    <animal>
        <id>5</id>
        <scientificName>Spheniscus mendiculus</scientificName>
        <status>good</status>
        <veterinarian>Be</veterinarian>
        <created>2013-06-23T07:53:29.411-03:00</created>
        <age>9</age>
    </animal>
    <animal>
        <id>9</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-09-25T09:01:33.181-03:00</created>
        <age>4</age>
    </animal>
    <animal>
        <id>6</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-07-09T03:45:11.726-03:00</created>
        <age>21</age>
    </animal>
    <animal>
        <id>23</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-01-18T12:13:11.255-02:00</created>
        <age>8</age>
    </animal>
    <animal>
        <id>9</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>bad</status>
        <veterinarian>John</veterinarian>
        <created>2013-08-14T15:08:47.841-03:00</created>
        <age>2</age>
    </animal>
    <animal>
        <id>20</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-07-29T10:51:57.489-03:00</created>
        <age>3</age>
    </animal>
    <animal>
        <id>21</id>
        <scientificName>Spheniscus mendiculus</scientificName>
        <status>good</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-02-25T06:13:31.420-03:00</created>
        <age>10</age>
    </animal>
    <animal>
        <id>23</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-06-18T14:57:26.112-03:00</created>
        <age>27</age>
    </animal>
    <animal>
        <id>17</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>good</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-10-29T12:10:57.633-02:00</created>
        <age>23</age>
    </animal>
    <animal>
        <id>5</id>
        <scientificName>Panthera tigris tigris</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-09-26T15:22:34.473-03:00</created>
        <age>26</age>
    </animal>
    <animal>
        <id>1</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-08-06T22:38:02.006-03:00</created>
        <age>19</age>
    </animal>
    <animal>
        <id>8</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-02-27T14:41:35.242-03:00</created>
        <age>2</age>
    </animal>
    <animal>
        <id>21</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-03-04T00:24:16.831-03:00</created>
        <age>6</age>
    </animal>
    <animal>
        <id>1</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-10-30T07:13:21.658-02:00</created>
        <age>18</age>
    </animal>
    <animal>
        <id>13</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>good</status>
        <veterinarian>Be</veterinarian>
        <created>2013-11-13T01:58:09.226-02:00</created>
        <age>10</age>
    </animal>
    <animal>
        <id>16</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>good</status>
        <veterinarian>Be</veterinarian>
        <created>2013-08-26T01:58:33.569-03:00</created>
        <age>19</age>
    </animal>
    <animal>
        <id>27</id>
        <scientificName>Elephas maximus indicus</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-01-25T12:04:10.551-02:00</created>
        <age>18</age>
    </animal>
    <animal>
        <id>11</id>
        <scientificName>Elephas maximus indicus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-08-29T02:25:38.124-03:00</created>
        <age>27</age>
    </animal>
    <animal>
        <id>27</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-12-24T23:29:19.419-02:00</created>
        <age>23</age>
    </animal>
    <animal>
        <id>22</id>
        <scientificName>Diceros bicornis</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-10-29T17:44:35.819-02:00</created>
        <age>16</age>
    </animal>
    <animal>
        <id>18</id>
        <scientificName>Elephas maximus indicus</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-05-05T05:39:55.526-03:00</created>
        <age>21</age>
    </animal>
    <animal>
        <id>8</id>
        <scientificName>Diceros bicornis</scientificName>
        <status>bad</status>
        <veterinarian>John</veterinarian>
        <created>2013-01-25T01:30:06.503-02:00</created>
        <age>2</age>
    </animal>
    <animal>
        <id>11</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>good</status>
        <veterinarian>John</veterinarian>
        <created>2013-03-05T01:53:07.384-03:00</created>
        <age>0</age>
    </animal>
    <animal>
        <id>0</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>John</veterinarian>
        <created>2013-04-23T01:23:46.511-03:00</created>
        <age>19</age>
    </animal>
    <animal>
        <id>13</id>
        <scientificName>Pongo pygmaeus</scientificName>
        <status>good</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-07-03T10:37:25.542-03:00</created>
        <age>3</age>
    </animal>
    <animal>
        <id>28</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-11-14T16:53:25.696-02:00</created>
        <age>26</age>
    </animal>
    <animal>
        <id>14</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-12-12T21:02:05.362-02:00</created>
        <age>13</age>
    </animal>
    <animal>
        <id>20</id>
        <scientificName>Elephas maximus indicus</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-03-07T02:30:05.527-03:00</created>
        <age>18</age>
    </animal>
    <animal>
        <id>24</id>
        <scientificName>Spheniscus mendiculus</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-09-19T21:27:04.204-03:00</created>
        <age>18</age>
    </animal>
    <animal>
        <id>6</id>
        <scientificName>Pongo pygmaeus</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-09-14T11:24:11.519-03:00</created>
        <age>15</age>
    </animal>
    <animal>
        <id>22</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-04-15T02:41:44.618-03:00</created>
        <age>12</age>
    </animal>
    <animal>
        <id>18</id>
        <scientificName>Diceros bicornis</scientificName>
        <status>good</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-08-07T15:24:35.533-03:00</created>
        <age>10</age>
    </animal>
    <animal>
        <id>7</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>good</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-03-25T11:59:48.617-03:00</created>
        <age>13</age>
    </animal>
    <animal>
        <id>29</id>
        <scientificName>Elephas maximus indicus</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-09-19T15:11:54.793-03:00</created>
        <age>14</age>
    </animal>
    <animal>
        <id>9</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-08-28T04:16:45.537-03:00</created>
        <age>29</age>
    </animal>
    <animal>
        <id>23</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>bad</status>
        <veterinarian>John</veterinarian>
        <created>2013-05-02T10:39:12.431-03:00</created>
        <age>6</age>
    </animal>
    <animal>
        <id>30</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-01-07T00:41:03.385-02:00</created>
        <age>27</age>
    </animal>
    <animal>
        <id>2</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>good</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-06-23T12:20:18.285-03:00</created>
        <age>26</age>
    </animal>
    <animal>
        <id>22</id>
        <scientificName>Elephas maximus indicus</scientificName>
        <status>good</status>
        <veterinarian>Be</veterinarian>
        <created>2013-05-30T01:50:45.413-03:00</created>
        <age>9</age>
    </animal>
    <animal>
        <id>14</id>
        <scientificName>Panthera tigris tigris</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-04-26T17:15:59.490-03:00</created>
        <age>0</age>
    </animal>
    <animal>
        <id>20</id>
        <scientificName>Diceros bicornis</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-02-21T02:07:59.649-03:00</created>
        <age>3</age>
    </animal>
    <animal>
        <id>7</id>
        <scientificName>Spheniscus mendiculus</scientificName>
        <status>good</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-04-17T05:07:56.337-03:00</created>
        <age>8</age>
    </animal>
    <animal>
        <id>3</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-10-08T21:39:41.793-03:00</created>
        <age>10</age>
    </animal>
    <animal>
        <id>26</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>bad</status>
        <veterinarian>John</veterinarian>
        <created>2013-10-29T15:10:30.658-02:00</created>
        <age>18</age>
    </animal>
    <animal>
        <id>16</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>John</veterinarian>
        <created>2013-06-27T18:42:20.339-03:00</created>
        <age>30</age>
    </animal>
    <animal>
        <id>4</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-05-22T02:10:39.904-03:00</created>
        <age>11</age>
    </animal>
    <animal>
        <id>21</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>good</status>
        <veterinarian>Be</veterinarian>
        <created>2013-11-02T04:45:23.502-02:00</created>
        <age>8</age>
    </animal>
    <animal>
        <id>30</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-07-29T04:09:31.289-03:00</created>
        <age>25</age>
    </animal>
    <animal>
        <id>23</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>good</status>
        <veterinarian>John</veterinarian>
        <created>2013-08-25T03:19:04.714-03:00</created>
        <age>2</age>
    </animal>
    <animal>
        <id>30</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-02-11T14:06:22.403-02:00</created>
        <age>8</age>
    </animal>
    <animal>
        <id>2</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>good</status>
        <veterinarian>John</veterinarian>
        <created>2013-01-11T21:24:34.994-02:00</created>
        <age>16</age>
    </animal>
    <animal>
        <id>29</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-05-07T17:28:49.462-03:00</created>
        <age>9</age>
    </animal>
    <animal>
        <id>22</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-03-28T02:41:56.315-03:00</created>
        <age>12</age>
    </animal>
    <animal>
        <id>2</id>
        <scientificName>Diceros bicornis</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-04-15T18:31:40.301-03:00</created>
        <age>25</age>
    </animal>
    <animal>
        <id>6</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-11-06T08:35:24.134-02:00</created>
        <age>10</age>
    </animal>
    <animal>
        <id>26</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-06-21T18:31:34.996-03:00</created>
        <age>6</age>
    </animal>
    <animal>
        <id>0</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-04-13T16:59:03.479-03:00</created>
        <age>11</age>
    </animal>
    <animal>
        <id>14</id>
        <scientificName>Elephas maximus indicus</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-06-11T03:25:14.372-03:00</created>
        <age>28</age>
    </animal>
    <animal>
        <id>30</id>
        <scientificName>Spheniscus mendiculus</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-03-31T17:56:09.717-03:00</created>
        <age>7</age>
    </animal>
    <animal>
        <id>10</id>
        <scientificName>Pongo pygmaeus</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-05-08T15:21:56.763-03:00</created>
        <age>25</age>
    </animal>
    <animal>
        <id>25</id>
        <scientificName>Pongo pygmaeus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-03-23T02:04:52.324-03:00</created>
        <age>16</age>
    </animal>
    <animal>
        <id>10</id>
        <scientificName>Panthera tigris tigris</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-05-30T21:54:35.413-03:00</created>
        <age>10</age>
    </animal>
    <animal>
        <id>21</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-07-11T07:58:05.961-03:00</created>
        <age>19</age>
    </animal>
    <animal>
        <id>23</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-11-19T11:00:45.911-02:00</created>
        <age>14</age>
    </animal>
    <animal>
        <id>12</id>
        <scientificName>Panthera tigris tigris</scientificName>
        <status>good</status>
        <veterinarian>John</veterinarian>
        <created>2013-08-19T17:42:45.951-03:00</created>
        <age>0</age>
    </animal>
    <animal>
        <id>16</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>good</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-03-12T10:05:25.016-03:00</created>
        <age>0</age>
    </animal>
    <animal>
        <id>5</id>
        <scientificName>Diceros bicornis</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-07-19T00:16:35.200-03:00</created>
        <age>28</age>
    </animal>
    <animal>
        <id>17</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-05-18T07:31:33.690-03:00</created>
        <age>23</age>
    </animal>
    <animal>
        <id>25</id>
        <scientificName>Diceros bicornis</scientificName>
        <status>good</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-01-29T23:25:54.531-02:00</created>
        <age>25</age>
    </animal>
    <animal>
        <id>10</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>bad</status>
        <veterinarian>John</veterinarian>
        <created>2013-07-01T08:21:42.427-03:00</created>
        <age>15</age>
    </animal>
    <animal>
        <id>26</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>bad</status>
        <veterinarian>Be</veterinarian>
        <created>2013-11-23T17:50:38.479-02:00</created>
        <age>13</age>
    </animal>
    <animal>
        <id>21</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-10-23T03:38:16.132-02:00</created>
        <age>17</age>
    </animal>
    <animal>
        <id>26</id>
        <scientificName>Pongo pygmaeus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-05-14T13:20:10.600-03:00</created>
        <age>1</age>
    </animal>
    <animal>
        <id>16</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-09-21T06:56:31.084-03:00</created>
        <age>14</age>
    </animal>
    <animal>
        <id>30</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-11-01T08:32:57.813-02:00</created>
        <age>13</age>
    </animal>
    <animal>
        <id>18</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-02-05T23:48:25.080-02:00</created>
        <age>30</age>
    </animal>
    <animal>
        <id>17</id>
        <scientificName>Panthera pardus orientalis</scientificName>
        <status>good</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-01-18T16:20:25.287-02:00</created>
        <age>16</age>
    </animal>
    <animal>
        <id>29</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>good</status>
        <veterinarian>Be</veterinarian>
        <created>2013-05-09T23:49:17.277-03:00</created>
        <age>25</age>
    </animal>
    <animal>
        <id>11</id>
        <scientificName>Pongo pygmaeus</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-01-22T23:52:38.881-02:00</created>
        <age>27</age>
    </animal>
    <animal>
        <id>26</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-12-07T06:00:11.410-02:00</created>
        <age>7</age>
    </animal>
    <animal>
        <id>2</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>good</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-03-26T08:59:34.051-03:00</created>
        <age>19</age>
    </animal>
    <animal>
        <id>0</id>
        <scientificName>Panthera tigris tigris</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-12-15T00:32:28.328-02:00</created>
        <age>16</age>
    </animal>
    <animal>
        <id>0</id>
        <scientificName>Elephas maximus indicus</scientificName>
        <status>good</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-10-12T10:47:11.276-03:00</created>
        <age>17</age>
    </animal>
    <animal>
        <id>6</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>bad</status>
        <veterinarian>John</veterinarian>
        <created>2013-05-26T13:22:58.484-03:00</created>
        <age>15</age>
    </animal>
    <animal>
        <id>25</id>
        <scientificName>Mustela nigripes</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-08-17T19:39:30.794-03:00</created>
        <age>15</age>
    </animal>
    <animal>
        <id>23</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-12-23T14:03:26.664-02:00</created>
        <age>6</age>
    </animal>
    <animal>
        <id>13</id>
        <scientificName>Diceros bicornis</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-02-24T13:20:10.460-03:00</created>
        <age>27</age>
    </animal>
    <animal>
        <id>14</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-05-15T09:32:50.470-03:00</created>
        <age>15</age>
    </animal>
    <animal>
        <id>22</id>
        <scientificName>Diceros bicornis</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-04-21T09:35:32.587-03:00</created>
        <age>8</age>
    </animal>
    <animal>
        <id>24</id>
        <scientificName>Pongo pygmaeus</scientificName>
        <status>good</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-08-04T12:45:22.992-03:00</created>
        <age>6</age>
    </animal>
    <animal>
        <id>7</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>good</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-10-26T22:03:48.548-02:00</created>
        <age>26</age>
    </animal>
    <animal>
        <id>24</id>
        <scientificName>Gorilla beringei graueri</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-01-19T12:08:51.377-02:00</created>
        <age>20</age>
    </animal>
    <animal>
        <id>24</id>
        <scientificName>Pongo pygmaeus</scientificName>
        <status>bad</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-10-06T18:35:11.655-03:00</created>
        <age>9</age>
    </animal>
    <animal>
        <id>17</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>good</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-08-10T07:19:36.572-03:00</created>
        <age>2</age>
    </animal>
    <animal>
        <id>20</id>
        <scientificName>Panthera tigris tigris</scientificName>
        <status>good</status>
        <veterinarian>Be</veterinarian>
        <created>2013-04-30T01:07:24.911-03:00</created>
        <age>23</age>
    </animal>
    <animal>
        <id>18</id>
        <scientificName>Diceros bicornis</scientificName>
        <status>bad</status>
        <veterinarian>Ziggy</veterinarian>
        <created>2013-09-17T22:10:50.498-03:00</created>
        <age>12</age>
    </animal>
    <animal>
        <id>10</id>
        <scientificName>Ateles paniscus</scientificName>
        <status>good</status>
        <veterinarian>Fran</veterinarian>
        <created>2013-11-22T09:23:31.001-02:00</created>
        <age>27</age>
    </animal>
    <animal>
        <id>9</id>
        <scientificName>Lycaon pictus</scientificName>
        <status>good</status>
        <veterinarian>Tiago</veterinarian>
        <created>2013-05-23T04:56:18.030-03:00</created>
        <age>28</age>
    </animal>
</animals>
```

Here we have our JAXB mapped classes representing the XML above:

```java
import java.io.Serializable;
import java.util.Date;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Animal implements Serializable {

    private static final long serialVersionUID = 1L;

    @XmlElement
    private int id;
    @XmlElement
    private String scientificName;
    @XmlElement
    private String status;
    @XmlElement
    private String veterinarian;
    @XmlElement
    private Date created;
    @XmlElement
    private int age;

    public Animal() {
    }

    public Animal(int id, String scientificName, String status, String veterinarian, Date created, int age) {
        this.id = id;
        this.scientificName = scientificName;
        this.status = status;
        this.veterinarian = veterinarian;
        this.created = created;
        this.age = age;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVeterinarian() {
        return veterinarian;
    }

    public void setVeterinarian(String veterinarian) {
        this.veterinarian = veterinarian;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

```java
import java.io.Serializable;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Animals implements Serializable{

    private static final long serialVersionUID = 1L;

    @XmlElement(name = "animal")
    private List<Animal> animals;

    public List<Animal> getAnimals() {
        return animals;
    }

    public void setAnimals(List<Animal> animals) {
        this.animals = animals;
    }
}
```


This is the Camel implementation which reads XML file from inbox directory, process it and save it in the outbox directory.

Notice the `.streaming()` method which splits payload in streaming mode which means it will split the input message in chunks.

```java
import org.apache.camel.builder.RouteBuilder;

public class XmlRouter extends RouteBuilder {

    JAXBContext context = JAXBContext.newInstance(new Class[]{io.tiago.feed.Animals.class});
    JaxbDataFormat xmlDataFormat = new JaxbDataFormat();
    xmlDataFormat.setContext(context);

    from(INBOX).doTry().unmarshal(xmlDataFormat)
            .split().tokenizeXML("status")
            .streaming()
            .to("file://data/outbox")
            .end();
}
```

Finally our main method which tells Camel to follow its route.

One points to mention here is `context.disableJMX();` this method when called, disable JMX which reduces memory, If you need to monitor your application
you then can ignore it.

```java
import org.apache.camel.CamelContext;
import org.apache.camel.impl.DefaultCamelContext;

public class App {

    public static void main(String[] args) throws Exception {
        CamelContext context = new DefaultCamelContext();        
        context.disableJMX();        
        context.addRoutes(new XmlRouter());
        context.start();
        Thread.sleep(6000);
        context.stop();
    }
}
```

Apache Camel has many built-in component to handle XML easily I would recommend to take a look at [Camel Documentation](https://camel.apache.org/docs/)
to get know more about its API.