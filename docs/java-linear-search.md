# Linear Searching

Linear search are algorithms that sequentially checks each element of a list until a match is found or the whole list has been searched. 

Linear search has a time complexity of O(n)

`Check if element exists in array`
```java

public class LinearSearch {

    public static void main(String[] args) {

        int a[] = {11, 24, 37, 49, 510};

        System.out.println(hasElement(a, 11));
    }

    private static boolean hasElement(int items[], int elem) {

        for (int i = 0; i < items.length; i++) {

            if (items[i] == elem) {
                return true;
            }
        }

        return false;
    }
}


```
`Find the minor number in array`
```java

public class MinorElement {

    public static void main(String[] args) {

        int a[] = {110, 244, 37, 49, 510};

        System.out.println(getMinor(a));
    }

    private static int getMinor(int items[]) {

        int minor = 0;

        for (int i = 0; i < items.length; i++) {

            if (items[i] < items[minor]) {
                minor = i;
            }
        }

        return items[minor];
    }
}

```
`Find the min and max numbers in an array`
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