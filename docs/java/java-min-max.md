---
title:  'Min & Max Array Value'
date: 2010-05-17T19:18:41-03:00
draft: false
---

```java
public class Solution {
   
   public int max(int [] array) {
      int max = 0;
     
      for(int i=0; i<array.length; i++ ) {
         if(array[i]>max) {
            max = array[i];
         }
      }
      return max;
   }
   
   public int min(int [] array) {
      int min = array[0];
           
      for(int i=0; i<array.length; i++ ) {
         if(array[i]<min) {
            min = array[i];
         }
      }
      return min;
   }
   
   public static void main(String args[]) {
      int[] myArray = {103, 192, 1, 20, 2};
      Solution m = new Solution();
      System.out.println("Maximum value in the array is::"+m.max(myArray));
      System.out.println("Minimum value in the array is::"+m.min(myArray));
   }
}
```