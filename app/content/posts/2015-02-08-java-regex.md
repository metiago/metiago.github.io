---
title: 'Regular Expression'
date: "2015-02-08"
draft: false
image: "https://placehold.co/600x400"
---

Remove special characters.

```java
 public static void main(String[] args) {
    Scanner scan = new Scanner(System.in);
    String s = scan.nextLine();
    s = s.trim();
    if(s.equals("")) {
        System.out.println(0);
    } else{
        String[] r = s.split("[^a-zA-Z]+@*");
        System.out.println(r.length);
        for (int i = 0; i < r.length; i++) {
            System.out.println(r[i]);
        }
    }
    scan.close();
}
```

Match IP addresses.

```java
public static void main(String[] args) {

    List<String> ips = List.of("12.12.12.12",
                               "13.13.13.112", 
                               "VUUT.12.12", 
                               "111.111.11.111", 
                               "1.1.1.1.1.1.1", 
                               ".....",
                               "1...1..1..1", 
                               "0.0.0.0",
                               "255.0.255.0", 
                               "266.266.266.266", 
                               "00000.000000.0000000.00001",
                               "0023.0012.0012.0034");

    String regex = "^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(\\.(?!$)|$)){4}$";

    ips.forEach(ip -> {
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(ip);
        System.out.println(matcher.find());
    });
}
```

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

Repleca JSON keys

```bash
# Replace json values
"name": \s*"[^"]+?([^\/"]+)"

"name": "Ziggy"
```

###### Compare two strings lexicographically.

```java
public class Main {

    public static void main(String[] args) {
      
        Scanner sc = new Scanner(System.in);
        String a = sc.next();
        String b = sc.next();

        if (a.compareTo(b) > 0) {
            System.out.println("A > B");
        }
        else if (a.compareTo(b) < 0) {
            System.out.println("B > A");
        } else {
            System.out.println("B == A");
        }
    }
}
```

###### Palindrome

A string is said to be palindrome if the reverse of the string is the same as the string. For example, "abba" is a palindrome because the reverse of "abba" will be equal to "abba" so both of these strings are equal and are said to be a palindrome, but "abbc" is not a palindrome.

```java
public static void main(String[] args) {
    // "abba" = yes
    // "abbc" = no
    String word = "abba";
    
    StringBuilder sb = new StringBuilder();
    for (int i = word.length() - 1; i >= 0; i--) {
        sb.append(word.charAt(i));
    }
    if (sb.toString().equals(word)) {
        System.out.println("Yes");
    } else {
        System.out.println("No");
    }
}
```