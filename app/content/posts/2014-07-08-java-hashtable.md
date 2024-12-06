---
title: 'Hash Tables'
date: "2014-07-08"
draft: false
image: "https://placehold.co/600x400"
---

Hash tables are excellent for quick storage and retrieval of data based on key-value pairs. One example we can provide that represents a hash table
is the browser local storage.

A hash table contains two main functions: put() and get(). put() is used for storing data into the hash table, while get() is used for retrieving data from the hash table. There's another important function which is called `hash function`. It converts a specific key to an array index where the values are stored.

One technique that os commonly used to generate a key index is using `modulus operator` on a prime number e.g

1. 4 % 11 = 4
2. 7 % 11 = 7
3. 9 % 11 = 9
4. 15 % 11 = 4

But this technique can cause a key collision as you can see on item 4 `15 % 11 = 4`

It's possible to avoid these collisions using one of the three strategies below:

1 - Linear Probing

It finds the next empty index in the array using linear search.

2 - Quadratic Probing

Quadratic probing uses perfect squares instead of incrementing by 1 each time. `h + (1)^2, h + (2)^2, h + (3)^2, h + (4)^2`

3 - Rehashing / Double-Hashing

This uniformly distribute the keys by having a second hashing
function that hashes the result from the original. 

`hash2(x) = R − (x % R)`

x is the result from hashing the first time, and R is less than the size of the hash table.

### Examples

`Linear Probing`

```java
public class HashTable {

    int size;
    int[] keys;
    int[] values;
    int limit;

    public HashTable(int size) {
        this.size = size;
        this.keys = initArray();
        this.values = initArray();
        this.limit = 0;
    }

    public void put(int key, int value) throws Exception {
        if (this.limit > this.size) {
            throw new Exception("Table is full");
        }
        int hashedIndex = this.hash(key);
        while (this.keys[hashedIndex] != 0) {
            hashedIndex++;
            hashedIndex = hashedIndex + this.size;
        }
        this.keys[hashedIndex] = key;
        this.values[hashedIndex] = value;
        this.limit++;
    }

    public int get(int key) {
        var hashedIndex = this.hash(key);
        while (this.keys[hashedIndex] != key) {
            hashedIndex++;
            hashedIndex = hashedIndex % this.size;
        }
        return this.values[hashedIndex];
    }

    public int hash(int key) {
        return key % this.size;
    }

    public int[] initArray() {
        int[] arr = new int[this.size];
        for (var i = 0; i < this.size; i++) {
            arr[i] = 0;
        }
        return arr;
    }

    public static void main(String[] args) throws Exception {
        HashTable ht = new HashTable(4);
        ht.put(7, 1);
        ht.put(20, 2);
        ht.put(33, 3);
        ht.put(46, 4);
        for (int i = 0; i < ht.size; i++) {
            System.out.println(ht.keys[i]);
            System.out.println(ht.values[i]);
        }
    }
}
```

`Quadratic Probing`

```java
import java.util.Arrays;

public class HashTable {

    int size;
    int[] keys;
    int[] values;
    int limit;

    public HashTable(int size) {
        this.size = size;
        this.keys = initArray();
        this.values = initArray();
        this.limit = 0;
    }

    public void put(int key, int value) throws Exception {
        if (this.limit > this.size) {
            throw new Exception("Table is full");
        }
        int squareIndex = 1;
        int hashedIndex = this.hash(key);
        while (this.keys[hashedIndex] != 0) {
            hashedIndex += Math.pow(squareIndex, 2);
            hashedIndex++;
            squareIndex++;
        }
        this.keys[hashedIndex] = key;
        this.values[hashedIndex] = value;
        this.limit++;
    }

    public int get(int key) {
        int squareIndex = 1;
        var hashedIndex = this.hash(key);
        while (this.keys[hashedIndex] != key) {
            hashedIndex += Math.pow(squareIndex, 2);
            hashedIndex = hashedIndex % this.size;
            squareIndex++;
        }
        return this.values[hashedIndex];
    }

    public int hash(int key) {
        return key % this.size;
    }

    public int[] initArray() {
        int[] arr = new int[this.size];
        for (var i = 0; i < this.size; i++) {
            arr[i] = 0;
        }
        return arr;
    }

    public static void main(String[] args) throws Exception {
        HashTable ht = new HashTable(20);
        ht.put(7, 1);
        ht.put(20, 2);
        ht.put(33, 3);
        ht.put(46, 4);
        ht.put(50, 5);
        ht.put(63, 26);
        ht.put(77, 17);
        ht.put(91, 8);

        System.out.println(Arrays.toString(ht.keys));
        System.out.println(Arrays.toString(ht.values));
    }
}
```

`Rehashing / Double-Hashing`

On the output you can notice the difference on the hash keys where Double-Hashing is more uniformly distributed than Quadratic Probing

```java
import java.util.Arrays;

public class HashTable {

    int size;
    int[] keys;
    int[] values;
    int limit;

    public HashTable(int size) {
        this.size = size;
        this.keys = initArray();
        this.values = initArray();
        this.limit = 0;
    }

    public void put(int key, int value) throws Exception {
        if (this.limit > this.size) {
            throw new Exception("Table is full");
        }

        int hashedIndex = this.hash(key);
        while (this.keys[hashedIndex] != 0) {
            hashedIndex++;
            hashedIndex = hashedIndex % this.size;
        }
        this.keys[hashedIndex] = key;
        this.values[hashedIndex] = value;
        this.limit++;
    }

    public int get(int key) {
        var hashedIndex = this.hash(key);
        while (this.keys[hashedIndex] != key) {
            hashedIndex++;
            hashedIndex = hashedIndex % this.size;
        }
        return this.values[hashedIndex];
    }

    public int hash(int key) {
        return this.secondHash(key % this.size);
    }

    public int secondHash(int key) {
        var R = this.size -2;
        return R - key % R;
    }

    public int[] initArray() {
        int[] arr = new int[this.size];
        for (var i = 0; i < this.size; i++) {
            arr[i] = 0;
        }
        return arr;
    }

    public static void main(String[] args) throws Exception {
        HashTable ht = new HashTable(20);
        ht.put(7, 1);
        ht.put(20, 2);
        ht.put(33, 3);
        ht.put(46, 4);
        ht.put(50, 5);
        ht.put(63, 26);
        ht.put(77, 17);
        ht.put(91, 8);

        System.out.println(Arrays.toString(ht.keys));
        System.out.println(Arrays.toString(ht.values));
    }
}
```

A hash table is a fixed-sized data structure in which the size is defined at the start.
Hash tables are implemented using a hash function to generate an index for the array.
A good hash function is deterministic, efficient, and uniformly distributive.
