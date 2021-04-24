---
layout: post
title:  Java NIO Append Example
date:   2020-01-06 20:18:00 +0100
category: Dev
tags: algorithm datastructure design
---

## Intro

This is a small algorithm using Java NIO API which read files from a given directory, filter by a given extension and append some texts to each of them.

```java

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.stream.Stream;

public class AppendFile {

    String TEXT_TO_APPEND = """
                          
            def upgrade_test():
                pass
                  
            def downgrade_test():
                pass
              """;

    public static void main(String[] args) throws IOException {
        AppendFile appendFile = new AppendFile();
        appendFile.execute();
    }

    public void execute() throws IOException {
        Stream<Path> files = Files.walk(Paths.get(System.getProperty("user.dir") + "/versions"));
        files.filter(this::byPYExt).forEach(this::appendText);
    }

    private Boolean byPYExt(Path p) {
        return p.getFileName().toString().endsWith(".py");
    }

    private void appendText(Path p) {
        try {
            Files.write(p, TEXT_TO_APPEND.getBytes(), StandardOpenOption.APPEND);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}


```
