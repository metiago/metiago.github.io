---
title: 'Min & Max Array Value'
date: "2014-11-08"
draft: false
excerpt: ""
image: "https://images.pexels.com/photos/3482441/pexels-photo-3482441.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
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