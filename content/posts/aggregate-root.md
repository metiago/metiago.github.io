+++
title =  'Aggregate Roots (DDD)'
date = 1500-03-14T19:18:41-03:00
draft = false

+++

Aggregate is a group of objects that work together and are treated as a unit. 
When forming aggregates, asking yourself **`" Is X part of Z ? "`** might help in make the decision on what are
the objects that compose a specific unit.

DDD Aggregates are sometimes confused with collection classes (lists, maps, etc). DDD aggregates are domain concepts (order, clinic visit, playlist), while collections are generic.

`Order.java`

```java
@Entity
@Table(name = "order")
public class Order implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_gen")
    @SequenceGenerator(sequenceName = "order_seq", allocationSize = 1, name = "order_gen")
    @Column(name = "id")
    private Long idFxv;

    @Column(name = "order_date")
    @Temporal(TemporalType.DATE)
    private Date orderDate;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<OrderLine> orderLines;
```

`OrderLine.java`

```java
@Entity
@Table(name = "order_line")
public class OrderLine implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_line_gen")
    @SequenceGenerator(sequenceName = "order_line_seq", allocationSize = 1, name = "order_line_gen")
    @Column(name = "id")
    private Long id;

    @Column(name = "quantity")
    private Long quantity;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}
```

Having `Order` as our parent object and `OrderLine` as our children, we can say that `OrderLine is part of Order` so that `Order` is our root object, therefore, all (CRUD) operations should be done through `OrderRepository`.

```java
public interface VersOrderRepositoryionRepository extends JpaRepository<Version, Long> {
   
   // Fetch orders
   // Fetch order lines
   // Persist orders
   // persist order lines
   // etc...

}
```

#### Reference

<a href="https://www.amazon.com/gp/product/0321125215/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0321125215&linkCode=as2&tag=martinfowlerc-20" target="_blank"> Domain-Driven Design book </a>
