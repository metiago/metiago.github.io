---
title:  'Balanced Brackets'
date: 2014-05-25T19:18:41-03:00
draft: false
---

Balanced Brackets is a pretty cool algorithm that exemplify how to use Stack data structures.

{% raw %}
```java
import java.util.List;
import java.util.Stack;

public class Brackets {

    public static void main(String[] argh) {

        List<String> values = List.of("((()))",
                                      "[]{}(){()}((())){{{}{()()}{{}{", 
                                      "[[]][][]", "{}");

        for (String s : values) {
            System.out.println(check(s));
        }

    }

    public static boolean check(String input) {
        Stack<Character> stack = new Stack<>();
        if (input.startsWith("") || input.startsWith("]]") 
                                   || input.startsWith("))") 
                                   || input.length() % 2 != 0) {
            return false;
        }
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            switch (c) {
                case '{':
                case '[':
                case '(':
                    stack.push(c);
                    break;
                case '}':
                    if (stack.isEmpty() || stack.pop() != '{') {
                        return false;
                    }
                    break;
                case ')':
                    if (stack.isEmpty() || stack.pop() != '(') {
                        return false;
                    }
                    break;
                case ']':
                    if (stack.isEmpty() || stack.pop() != '[') {
                        return false;
                    }
                    break;
            }
        }
        return stack.size() == 0;
    }
}
```
{% endraw %}