---
title: 'Java Optional API'
date: "2017-03-08"
draft: false

---

### Return a boolean If The Optional Is Empty. Prefer Java 11, Optional.isEmpty()

```java
// AVOID (Java 11+)
public Optional<String> fetchCartItems(long id) {

    Cart cart = ... ; // this may be null
    ...    
    return Optional.ofNullable(cart);
}

public boolean cartIsEmpty(long id) {

    Optional<String> cart = fetchCartItems(id);

    return !cart.isPresent();
}

// PREFER (Java 11+)
public Optional<String> fetchCartItems(long id) {

    Cart cart = ... ; // this may be null
    ...    
    return Optional.ofNullable(cart);
}

public boolean cartIsEmpty(long id) {

    Optional<String> cart = fetchCartItems(id);

    return cart.isEmpty();
}
```

### Avoid Using Identity-Sensitive Operations on Optionals

```java
// AVOID
Product product = new Product();
Optional<Product> op1 = Optional.of(product);
Optional<Product> op2 = Optional.of(product);

// op1 == op2 => false, expected true
if (op1 == op2) { ...

// PREFER
Product product = new Product();
Optional<Product> op1 = Optional.of(product);
Optional<Product> op2 = Optional.of(product);

// op1.equals(op2) => true, expected true
if (op1.equals(op2)) { ...
```

### Do We Need to Chain the Optional API With the Stream API?

```java
// AVOID
public boolean validatePasswordLength(User userId) {

    Optional<String> password = ...; // User password

    if (password.isPresent()) {
        return password.get().length() > 5;
    }

    return false;
}

// PREFER
public boolean validatePasswordLength(User userId) {

    Optional<String> password = ...; // User password

    return password.filter((p) -> p.length() > 5).isPresent();
}
```

### Reject Wrapped Values Based on a Predefined Rule Using filter()

```java
// PREFER
Optional<String> lowername ...; // may be empty

// transform name to upper case
Optional<String> uppername = lowername.map(String::toUpperCase);
```

### Transform Values Via Map() and flatMap()

```java
// AVOID
Optional<String> lowername ...; // may be empty

// transform name to upper case
Optional<String> uppername;
if (lowername.isPresent()) {
    uppername = Optional.of(lowername.get().toUpperCase());
} else {
    uppername = Optional.empty();
}
```

### There Is No Need to Unwrap Optionals for Asserting Equality

```java
// AVOID
Optional<String> actualItem = Optional.of("Shoes");
Optional<String> expectedItem = Optional.of("Shoes");        

assertEquals(expectedItem.get(), actualItem.get());

// PREFER
Optional<String> actualItem = Optional.of("Shoes");
Optional<String> expectedItem = Optional.of("Shoes");        

assertEquals(expectedItem, actualItem);
```

### Avoid Optional <T> and Choose Non-Generic OptionalInt, OptionalLong, or OptionalDouble

```java
// AVOID
Optional<Integer> price = Optional.of(50);
Optional<Long> price = Optional.of(50L);
Optional<Double> price = Optional.of(50.43d);

// PREFER
OptionalInt price = OptionalInt.of(50);           // unwrap via getAsInt()
OptionalLong price = OptionalLong.of(50L);        // unwrap via getAsLong()
OptionalDouble price = OptionalDouble.of(50.43d); // unwrap via getAsDouble()
```

### Do Not Confuse Optional.of() and Optional.ofNullable()

```java
// AVOID
public Optional<String> fetchItemName(long id) {

    String itemName = ... ; // this may result in null
    ...
    return Optional.of(itemName); // this throws NPE if "itemName" is null :(
}

// PREFER
public Optional<String> fetchItemName(long id) {

    String itemName = ... ; // this may result in null
    ...
    return Optional.ofNullable(itemName); // no risk for NPE    
}
```

### Avoid Using Optional in Collections

```java
// AVOID
Map<String, Optional<String>> items = new HashMap<>();
items.put("I1", Optional.ofNullable(...));
items.put("I2", Optional.ofNullable(...));
...

Optional<String> item = items.get("I1");

if (item == null) {
    System.out.println("This key cannot be found");
} else {
    String unwrappedItem = item.orElse("NOT FOUND");
    System.out.println("Key found, Item: " + unwrappedItem);
}

//PREFER
Map<String, String> items = new HashMap<>();
items.put("I1", "Shoes");
items.put("I2", null);
...
// get an item
String item = get(items, "I1");  // Shoes
String item = get(items, "I2");  // null
String item = get(items, "I3");  // NOT FOUND

private static String get(Map<String, String> map, String key) {
  return map.getOrDefault(key, "NOT FOUND");
}
```

### Do Not Use Optional to Return Empty Collections or Arrays

```java
// AVOID
public Optional<List<String>> fetchCartItems(long id) {

    Cart cart = ... ;    
    List<String> items = cart.getItems(); // this may return null

    return Optional.ofNullable(items);
}

// PREFER
public List<String> fetchCartItems(long id) {

    Cart cart = ... ;    
    List<String> items = cart.getItems(); // this may return null

    return items == null ? Collections.emptyList() : items;
}
```

### Do Not Use Optional in Methods Arguments

```java
// AVOID
public void renderCustomer(Cart cart, Optional<Renderer> renderer,
                           Optional<String> name) {     
    if (cart == null) {
        throw new IllegalArgumentException("Cart cannot be null");
    }

    Renderer customerRenderer = renderer.orElseThrow(
        () -> new IllegalArgumentException("Renderer cannot be null")
    );    

    String customerName = name.orElseGet(() -> "anonymous"); 
    ...
}

// call the method - don't do this
renderCustomer(cart, Optional.<Renderer>of(CoolRenderer::new), Optional.empty());

// PREFER
public void renderCustomer(Cart cart, Renderer renderer, String name) {

    if (cart == null) {
        throw new IllegalArgumentException("Cart cannot be null");
    }

    if (renderer == null) {
        throw new IllegalArgumentException("Renderer cannot be null");
    }

    String customerName = Objects.requireNonNullElseGet(name, () -> "anonymous");
    ...
}

// call this method
renderCustomer(cart, new CoolRenderer(), null);

// ALSO PREFER
public void renderCustomer(Cart cart, Renderer renderer, String name) {

    Objects.requireNonNull(cart, "Cart cannot be null");        
    Objects.requireNonNull(renderer, "Renderer cannot be null");        

    String customerName = Objects.requireNonNullElseGet(name, () -> "anonymous");
    ...
}

// call this method
renderCustomer(cart, new CoolRenderer(), null);

// AND

// write your own helper
public final class MyObjects {

    private MyObjects() {
        throw new AssertionError("Cannot create instances for you!");
    }

    public static <T, X extends Throwable> T requireNotNullOrElseThrow(T obj, 
        Supplier<? extends X> exceptionSupplier) throws X {       

        if (obj != null) {
            return obj;
        } else { 
            throw exceptionSupplier.get();
        }
    }
}

public void renderCustomer(Cart cart, Renderer renderer, String name) {

    MyObjects.requireNotNullOrElseThrow(cart, 
                () -> new IllegalArgumentException("Cart cannot be null"));
    MyObjects.requireNotNullOrElseThrow(renderer, 
                () -> new IllegalArgumentException("Renderer cannot be null"));    

    String customerName = Objects.requireNonNullElseGet(name, () -> "anonymous");
    ...
}
```

### Do Not Use Optional in Setters Arguments

```java
// AVOID
@Entity
public class Customer implements Serializable {

    private static final long serialVersionUID = 1L;
    ...
    @Column(name="customer_zip")
    private Optional<String> postcode; // optional field, thus may be null

     public Optional<String> getPostcode() {
       return postcode;
     }

     public void setPostcode(Optional<String> postcode) {
       this.postcode = postcode;
     }
     ...
}

// PREFER
@Entity
public class Customer implements Serializable {

    private static final long serialVersionUID = 1L;
    ...
    @Column(name="customer_zip")
    private String postcode; // optional field, thus may be null

    public Optional<String> getPostcode() {
      return Optional.ofNullable(postcode);
    }

    public void setPostcode(String postcode) {
       this.postcode = postcode;
    }
    ...
}
```

### Do Not Use Optional in Constructors Arguments

```java
// AVOID
public class Customer {

    private final String name;               // cannot be null
    private final Optional<String> postcode; // optional field, thus may be null

    public Customer(String name, Optional<String> postcode) {
        this.name = Objects.requireNonNull(name, () -> "Name cannot be null");
        this.postcode = postcode;
    }

    public Optional<String> getPostcode() {
        return postcode;
    }
    ...
}

// PREFER
public class Customer {

    private final String name;     // cannot be null
    private final String postcode; // optional field, thus may be null

    public Cart(String name, String postcode) {
        this.name = Objects.requireNonNull(name, () -> "Name cannot be null");
        this.postcode = postcode;
    }

    public Optional<String> getPostcode() {
        return Optional.ofNullable(postcode);
    }
    ...
}
```

### Never Assign Null to an Optional Variable

```java
// AVOID
public Optional<Cart> fetchCart() {
    Optional<Cart> emptyCart = null;
}

// PREFER
public Optional<Cart> fetchCart() {
    Optional<Cart> emptyCart = Optional.empty();
}      
```

### Ensure That an Optional Has a Value Before Calling Optional.get()

```java
// AVOID
Optional<Cart> cart = data.get();

// PREFER
if (cart.isPresent()) {
    Cart myCart = cart.get();
}
```

### When No Value Is Present, Set/Return an Already-Constructed Default Object Via the Optional.orElse() Method

```java
// AVOID
public static final String USER_STATUS = "UNKNOWN";

public String findUserStatus(long id) {
    Optional<String> status = ... ;
    if (status.isPresent()) {
        return status.get();
    } else {
        return USER_STATUS;
    }
}

// PREFER
public static final String USER_STATUS = "UNKNOWN";

public String findUserStatus(long id) {
    Optional<String> status = ... ;
    return status.orElse(USER_STATUS);
}
```

### When No Value Is Present, Set/Return a Non-Existent Default Object Via the Optional.orElseGet() Method

```java
// AVOID
public String computeStatus() {}

public String findUserStatus(long id) {
    Optional<String> status = ... ;
    if (status.isPresent()) {
        return status.get();
    } else {
        return computeStatus();
    }
}

public String findUserStatus(long id) {
    Optional<String> status = ... ;
    return status.orElse(computeStatus()); 
}

// PREFER
public String findUserStatus(long id) {
    Optional<String> status = ... ;
    return status.orElseGet(this::computeStatus);
}
```

### When No Value Is Present, Throw a NoSuchElementException Exception Via orElseThrow()

```java
// AVOID
public String findUserStatus(long id) {
    Optional<String> status = ... ;
    if (status.isPresent()) {
        return status.get();
    } else {
        throw new NoSuchElementException();        
    }
}

// PREFER
public String findUserStatus(long id) {
    Optional<String> status = ... ;
    return status.orElseThrow(new NoSuchElementException());
}
```

### Consume an Optional if it Is Present. Do Nothing if it Is Not Present. This Is a Job For Optional.ifPresent().

```java
// AVOID
Optional<String> status = ... ;

if (status.isPresent()) {
    System.out.println("Status: " + status.get());
}

// PREFER
Optional<String> status ... ;
...
status.ifPresent(System.out::println);  
```

### Consume an Optional if it's Present. If it's not present, then execute an empty-Based Action

```java
// AVOID
Optional<String> status = ... ;

if(status.isPresent()) {
    System.out.println("Status: " + status.get());
} else {
    System.out.println("Status not found");
}

// PREFER
Optional<String> status = ... ;
status.ifPresentOrElse(System.out::println, () -> System.out.println("Status not found"));
```

### When the Value Is Present, Set/Return That Optional. When No Value Is Present, Set/Return the Other Optional. This Is a Job For Optional.or(), Java 9.

```java
// AVOID
public Optional<String> fetchStatus() {

    Optional<String> status = ... ;
    Optional<String> defaultStatus = Optional.of("PENDING");

    if (status.isPresent()) {
        return status;
    } else {
        return defaultStatus;
    }  
}

// ALSO AVOID
public Optional<String> fetchStatus() {

    Optional<String> status = ... ;

    return status.orElseGet(() -> Optional.<String>of("PENDING"));
}

// PREFER
public Optional<String> fetchStatus() {

    Optional<String> status = ... ;
    Optional<String> defaultStatus = Optional.of("PENDING");

    return status.or(() -> defaultStatus);
    // or, without defining "defaultStatus"
    return status.or(() -> Optional.of("PENDING"));
}
```