---
layout: post
title:  Java - Create CSV File
date:   2018-12-05 20:18:00 +0100
category: Dev
tags: java csv
---

## Java - Create CSV File

Below there's a simple implementation to create a CSV file.

```java
package com.tiago.csv;

import java.io.File;
import java.io.PrintWriter;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;

import com.tiago.random.RandomData;

public class Csv {

    public static void main(String[] args) {

        PrintWriter pw = null;

        StringBuilder sb = new StringBuilder();

        try {

            pw = new PrintWriter(new File("animals.csv"));

            for (int i = 0; i < 10; i++) {

                sb.append(String.valueOf(RandomData.getIds()));
                sb.append(',');
                sb.append(String.valueOf(RandomData.animalsNames().get(new Random().nextInt(RandomData.animalsNames().size()))));
                sb.append(',');
                sb.append(String.valueOf(RandomData.status().get(new Random().nextInt(RandomData.status().size()))));
                sb.append(',');
                sb.append(String.valueOf(RandomData.veterinarians().get(new Random().nextInt(RandomData.veterinarians().size()))));
                sb.append(',');

                DateFormat format = new SimpleDateFormat("yyyy-MM-dd");
                sb.append(String.valueOf(format.format(new Date(RandomData.getRandomTimeBetweenTwoDates()))));
                sb.append('\n');
            }

            pw.write(sb.toString());
            pw.close();

            System.out.println("Done!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```