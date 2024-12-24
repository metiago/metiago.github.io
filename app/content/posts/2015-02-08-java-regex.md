---
title: 'Regular Expression'
date: "2015-02-08"
draft: false
excerpt: ""
image: "https://cdn.pixabay.com/photo/2020/08/12/09/42/dog-5482171_1280.jpg"
---


Matching words starting with `t`

```java
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Example {

    public static void main(String[] args) {

        String text = "The best time to plant a tree was 20 years ago. The second best time is now.";
        String regex = "\\b(t)\\w*";

        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        while (matcher.find()) { // perform a global search
            System.out.println(matcher.group());
        }
    }

}
```