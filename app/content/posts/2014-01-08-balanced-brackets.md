---
title: 'Balanced Brackets'
date: "2014-01-08"
draft: false
image: "https://images.unsplash.com/photo-1565204412258-08dfea5c871c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
---

Balanced Brackets is a cool challenge that exemplify how to use Stack data structure.

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