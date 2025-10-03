---
title:  'Data Store - Quick Reference'
date: "2017-07-13"
draft: false
---

Weaknesses and strengths of different data stores and when to use each.
 
### Relational database management systems (MySQL, PostgreSQL) 

Relational databases were developed in the 1970s to handle the increasing flood of data being produced. They have a solid foundational theory and have influenced nearly every database system in use today. 

Relational databases store data sets as “relations”: tables with rows and columns where all information is stored as a value of a specific cell. Data in an RDBMS is managed using SQL. Though there are different implementations, SQL is standardized and provides a level of predictability and utility. 

After an early flood of vendors tried to take advantage of the system’s popularity with not-quite-relational products, creator E.F. Codd outlined a set of rules that must be followed by all relational database management systems. Codd’s 12 rules revolve around imposing strict internal structure protocols, making sure that searches reliably return requested data, and preventing structural alterations (at least by users). The framework ensured that relational databases are consistent and reliable to this day. 

### Strengths 

Relational databases excel at handling highly structured data and provide support for ACID (Atomicity, Consistency, Isolation, and Durability) transactions. Data is easily stored and retrieved using SQL queries. The structure can be scaled up quickly because adding data without modifying existing data is simple. 

Creating limits on what certain user types can access or modify is built into the structure of an RDBMS. Because of this, relational databases are well-suited to applications that require tiered access. For example, customers could view their accounts while agents could both view and make necessary changes. 

### Weaknesses 

The biggest weakness of relational databases is the mirror of their biggest strength. As good as they are at handling structured data, they have a hard time with unstructured data. Representing real world entities in context is difficult in the bounds of an RDBMS. “Sliced” data has to be reassembled from tables into something more readable, and speed can be negatively impacted. The fixed schema doesn’t react well to change, either. 

Cost is a consideration with relational databases. They tend to be more expensive to set up and grow. Horizontal scaling, or scaling by adding more servers, is usually both faster and more economical than vertical scaling, which involves adding more resources to a server. However, the structure of relational databases complicates the process. Sharding (where data is horizontally partitioned and distributed across a collection of machines) is necessary to scale out a relational database. Sharding relational databases while maintaining ACID compliance can be a challenge. 

### Use a relational database for: 

1. Situations where data integrity is absolutely paramount (i.e., for financial applications, defense and security, and private health information) 

1. Highly structured data 

1. Automation of internal processes 

### Document store (MongoDB, Couchbase) 

A document store is a nonrelational database that stores data in JSON, BSON, or XML documents. They feature a flexible schema. Unlike SQL databases, where users must declare a table’s schema before inserting data, document stores don’t enforce document structure. Documents can contain any data desired. They have key-value pairs but also embed attribute metadata to make querying easier. 

### Strengths 

Document stores are very flexible. They handle semistructured and unstructured data well. Users don’t need to know during set-up what types of data will be stored, so this is a good choice when it isn’t clear in advance what sort of data will be incoming. 

Users can create their desired structure in a particular document without affecting all documents. Schema can be modified without causing downtime, which leads to high availability. Write speed is generally fast, as well. 

Besides flexibility, developers like document stores because they’re easy to scale horizontally. The sharding necessary for horizontal scaling is much more intuitive than with relational databases, so document stores scale out fast and efficiently. 

### Weaknesses 

Document databases sacrifice ACID compliance for flexibility. Also, while querying can be done in a document it’s not possible across documents. 

### Use a document database for: 

1. Unstructured or semistructured data 

1. Content management 

1. In-depth data analysis 

1. Rapid prototyping 

### Key-value store (Redis, Memcached) 

A key-value store is a type of nonrelational database where each value is associated with a specific key. It’s also known as an associative array. 

The “key” is a unique identifier associated only with the value. Keys can be anything allowed by the DBMS. In Redis, for example, keys man be any binary sequence up to 512MB. 

“Values” are stored as blobs and don’t need predefined schema. They can take nearly any form: numbers, strings, counters, JSON, XML, HTML, PHP, binaries, images, short videos, lists, and even another key-value pair encapsulated in an object. Some DBMSs allow for the data type to be specified, but it isn’t mandatory. 


Strengths 

This style of database has a lot of positives. It’s incredibly flexible, able to handle a very wide array of data types easily. Keys are used to go straight to the value with no index searching or joins, so performance is high. Portability is another benefit: key-value stores can be moved from one system to another without rewriting code. Finally, they’re highly horizontally scalable and have lower operating costs overall. 

Weaknesses 

Flexibility comes at a price. It’s impossible to query values, because they’re stored as a blob and can only be returned as such. This makes it hard to do reporting or edit parts of values. Not all objects are easy to model as key-value pairs, either. 

### Use a key-value store for: 

1. Recommendations 

1. User profiles and settings 

1. Unstructured data such as product reviews or blog comments 

1. Session management at scale 

1. Data that will be accessed frequently but not often updated 

### Wide-column store (Cassandra, HBase) 

Wide-column stores, also called column stores or extensible record stores, are dynamic column-oriented nonrelational databases. They’re sometimes seen as a type of key-value store but have attributes of traditional relational databases as well. 

Wide-column stores use the concept of a keyspace instead of schemas. A keyspace encompasses column families (similar to tables but more flexible in structure), each of which contains multiple rows with distinct columns. Each row doesn’t need to have the same number or type of column. A timestamp determines the most recent version of data. 

### Strengths 

This type of database has some benefits of both relational and nonrelational databases. It deals better with both structured and semistructured data than other nonrelational databases, and it’s easier to update. Compared to relational databases, it’s more horizontally scalable and faster at scale. 

Columnar databases compress better than row-based systems. Also, large data sets are simple to explore. Wide-column stores are particularly good at aggregation queries, for example. 

### Weaknesses 

Writes are expensive in the small. While updating is easy to do in bulk, uploading and updating individual records is hard. Plus, wide-column stores are slower than relational databases when handling transactions. 

### Use a wide-column store for: 

1. Big data analytics where speed is important 

1. Data warehousing on big data 

1. Large scale projects (this database style is not a good tool for average transactional applications) 

### Search engine (Elasticsearch) 

It may seem strange to include search engines in an article about database types. However, Elasticsearch has seen increased popularity in this sphere as developers look for innovative ways to cut down search lag. Elastisearch is a nonrelational, document-based data storage and retrieval solution specifically arranged and optimized for the storage and rapid retrieval of data. 

### Strengths 

Elastisearch is very scalable. It features flexible schema and fast retrieval of records, with advanced search options including full text search, suggestions, and complex search expressions. 

One of the most interesting search features is stemming. Stemming analyzes the root form of a word to find relevant records even when another form is used. For example, a user searching an employment database for “paying jobs” would also find positions tagged as “paid” and “pay.” 

### Weaknesses 

Elastisearch is used more as an intermediary or supplementary store than a primary database. It has low durability and poor security. There’s no innate authentication or access control. Also, Elastisearch doesn’t support transactions. 

### Use a search engine like Elastisearch for: 

1. Improving user experience with faster search results 

1. Logging 


### CAP Theorem

<img src="/images/database-triangle.png" width="auto" >


