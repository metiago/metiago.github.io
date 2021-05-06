---
layout: post
title:  JPA - Sequence Mapping
date:   2017-06-07 20:18:00 +0100
tags: java hibernate jpa
---

When working with Oracle or Postgres databases is pretty common to use sequences to manage increment ID(s). 

This snippet below demonstrate how to map a JPA entity to use sequences objects.

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

