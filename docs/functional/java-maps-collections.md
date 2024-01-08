# Maps

Find the first non-repeated value
```java

public static void main(String[] args) {

    List<Integer> nums = List.of(1, 1, 2, 2, 3, 4, 4, 5, 5);

    Map<Integer, Integer> x = new LinkedHashMap<>();

    for (int i = 0; i < nums.size(); i++) {
        Integer n = nums.get(i);
        if (!x.containsKey(n)) {
            x.put(n, 1);
        } else {
            Integer v = x.get(n);
            x.put(n, v + 1);
        }
    }

    for (Map.Entry<Integer, Integer> entry : x.entrySet()) {

        if (entry.getValue() <= 1) {
            System.out.println(entry.getKey());
            break;
        }
    }
} 
```

Tradional loop in map datastructure

```java
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class LoopMap {

    public static void main(String[] args) {

        Map<String, String> map = new HashMap<>();
        map.put("1", "Jan");
        map.put("2", "Feb");
        
        for (Map.Entry<String, String> entry : map.entrySet()) {
            System.out.println("Key : " + entry.getKey() + " Value : " + entry.getValue());
        }
        
    }
}
```

# Collections

Shuffle array using Collections API

```java

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ShuffleArray {

	public static void main(String[] args) {

		Integer[] intArray = { 1, 2, 3, 4, 5, 6, 7};

		// Arrays.asList() works with an array of objects 
		// only because autoboxing doesn’t work with generics.
		List<Integer> intList = Arrays.asList(intArray);

		Collections.shuffle(intList);

		intList.toArray(intArray);

		System.out.println(Arrays.toString(intArray));
	}
}

```

Shuffle array using index change
```java 
import java.util.Arrays;
import java.util.Random;

public class ShuffleArray {

	public static void main(String[] args) {
		
		int[] array = { 1, 2, 3, 4, 5, 6, 7 };
		
		Random rand = new Random();
		
		for (int i = 0; i < array.length; i++) {
			int randomIndexToSwap = rand.nextInt(array.length);
			int temp = array[randomIndexToSwap];
			array[randomIndexToSwap] = array[i];
			array[i] = temp;
		}
		System.out.println(Arrays.toString(array));
	}
}
```
