+++
title =  'JPA - Sequence Mapping'
date = 1500-03-11T19:18:41-03:00
draft = true
+++

How to map sequence ids for Oracle and Postgres database. 

```java
import javax.persistence.*;
import java.io.Serializable;
import java.util.List;
import java.util.Set;


@Entity
@Table(name = "posts", indexes = {@Index(name = "IDX_POST_NAME", columnList = "name")})
public class Post extends Base implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_gen")
    @SequenceGenerator(sequenceName = "post_seq", allocationSize = 1, name = "post_gen")
    @Column(name = "id")
    private Long id;

    private String name;

    private String file;

    private String about;

    @OneToMany(mappedBy = "post", orphanRemoval = true, cascade = {CascadeType.REMOVE}, fetch = FetchType.LAZY)
    private List<Post> posts;

    @ManyToMany(mappedBy = "posts", fetch = FetchType.LAZY)
    private Set<User> users;

    @OneToMany(mappedBy = "post", orphanRemoval = true, cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE}, fetch = FetchType.LAZY)
    private List<Follower> followers;
}
```

