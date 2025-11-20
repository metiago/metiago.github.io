---
title: "Testing MongoDB Repositories in Spring Boot"
date: "2025-07-03"
draft: false
---

In this post, I'm sharing examples of how to test MongoDB repository using Spring Boot. 
This code snippet demonstrates how to set up a test environment using annotations and JUnit features effectively.

```java
@Import({MongoConfig.class})
@DataMongoTest
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DocumentoLegalRepositoryTest {

    @Autowired
    private DocumentoLegalRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void shouldFindDocumentByIdAndYearExample{

        var fixture = new InformeRendimentoFixture();

        repository.save(fixture.documento);

        var resp = repository.findByDocumentoAndAnoBase(fixture.suid, fixture.ano);

        if (resp.isEmpty()) {
            throw new IllegalArgumentException("Data not found");
        }

        var documento = resp.get();
        assertNull(documento);
        // more asserts
    }    
}
```