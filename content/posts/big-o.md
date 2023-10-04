+++

title =  'Big O Notation'
date = 1500-01-02T19:18:41-03:00


+++

Big-O measures how well an operation will "scale" when you increase the amount of input data it operates on. Big-O can be used to describe how fast an algorithm will run, or it can describe other behaviour such as how much memory an algorithm will use.

| Big-O  | Operations for input of 10 items| Operations for input of 100 items |
| ++++++++++++- | ++++++++++++- | ++++++++++++- |
| O(1)  | 1  | 1
| O(log n)  | 3  | 7
| O(n)  | 10  | 100
| O(n log n)  | 30  | 700
| O(n^2)  | 100  | 1000
| O(2^n)  | 1024  | 2^100
| O(n!)  | 3628800  | 100!

<br>

### O(1)
Means that no matter how large the input is, the time taken doesn’t change. Its operations run in constant time. Some examples of O(1) operations are:
* Determining if a number is even or odd.
* sing a constant-size lookup table or hash table.

The following function will take the same time to execute, no matter how big array is:
```python
def is_first_element_null(array)
  if array[0] == nil
    return true
  else
    return false
  end
end
```

### O(log n)
The operation will take longer as the input size increases, but once the input gets fairly large it won’t change enough to worry about. If you double n, you have to spend an extra amount of time t to complete the task. If n doubles again, t won’t double, but will increase by a constant amount.

Example of an O(log n) operation is finding an item in a sorted list with a balanced search tree or a binary search


### O(n)
O(n) means that for every element, you are doing a constant number of operations, such as comparing each element to a known value.
O(n) operations run in linear time - the larger the input, the longer it takes, in an even tradeoff. Every time you double n, the operation will take twice as long.

An example of an O(n) operation is finding an item in an unsorted list
```python
def contains_value(array, value)
  for entry in array
    return true if entry == value
  end
  return false
end
```

### O(n log n)
O(n log n) means that you’re performing an O(log n) operation for each item in your input. Most (efficient) sort algorithms are an example of this.
O(n log n) operations run in loglinear time - increasing the input size hurts, but may still be manageable. Every time you double n, you spend twice as much time plus a little more.

Examples of O(n log n) operations are quicksort (in the average and best case), heapsort and merge sort.

### O(n2)
O(n2) means that for every element, you do something with every other element, such as comparing them.
O(n2) operations run in quadratic time - the operation is only really practical up to a certain input size. Every time n doubles, the operation takes four times as long.
Examples of O(n2) operations are quicksort (in the worst case) and bubble sort.

### O(2n)
O(2n) means that the time taken will double with each additional element in the input data set.
O(2n) operations run in exponential time - the operation is impractical for any reasonably large input size n.
An example of an O(2n) operation is the travelling salesman problem (using dynamic programming).

### O(n!)
O(n!) involves doing something for all possible permutations of the n elements.
O(n!) operations run in factorial time - the operation is impractical for any reasonably large input size n.
An example of an O(n!) operation is the travelling salesman problem using brute force, where every combination of paths will be examined.

### Big-O Graph

![Image of Big O]({{site.github.url}}/assets/img/time_complexity.png)
