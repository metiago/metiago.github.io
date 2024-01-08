# Strings

`Compare two strings lexicographically.`

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

`Palindrome`

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