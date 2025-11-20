---
title: "Mockito Quick Reference: Essential Tips for Effortless Mocking"
date: "2024-07-03"
draft: false

---

## Mockito

Mockito is a popular mocking framework for Java that allows developers to create mock objects in automated unit tests.

### Basic Concepts

- **Mocks**: Mocks are objects that simulate the behavior of real objects in a controlled way. They are used to verify interactions between the code under test and its dependencies. Mocks can be configured to return specific values when certain methods are called, and they can also record how they were interacted with, allowing you to assert that certain methods were called with specific arguments.

- **Stubs**: Stubs are simpler than mocks and are primarily used to provide predefined responses to method calls during tests. They do not track interactions or verify how they were used; their main purpose is to supply data needed for the test to run.

### Unit Tests
Unit tests are automated tests written and executed by software developers to validate individual units of code, like functions or classes, for correctness.

#### Purpose
1. Verify Functionality: Ensure that each piece of code behaves as expected.
1. Catch Bugs Early: Identify issues before the software reaches production, thus lowering the cost of fixes.
1. Facilitate Refactoring: Allow developers to refactor code confidently, knowing that existing functionality is covered by tests.
1. Enhance Documentation: Serve as documentation for how functions are supposed to behave.

#### Characteristics
1. Isolated: Each unit test should focus on a single behavior and isolate that unit from external dependencies (like databases or services).
1. Automatable: Tests can be run automatically using testing frameworks.
1. Fast: Unit tests should execute quickly to enable frequent testing during development.

### Examples

#### How to test private methods
This code snippet is a unit test for a method in the DocumentoLegalService class. 
It uses Mockito to handle exceptions and Java's MethodHandle to invoke a private method.

```java
@Test
void testSomeException() throws Throwable {

    when(futureMock.get()).thenThrow(new CapitalException("Erro ao obter tipoProduto: Produto X"));

    MethodHandles.Lookup lookup = MethodHandles.privateLookupIn(DocumentoLegalService.class, MethodHandles.lookup());
    MethodType mt = MethodType.methodType(List.class, Future.class, String.class);
    MethodHandle mh = lookup.findVirtual(DocumentoLegalService.class, "getFutureTask", mt);

    assertThrows(CapitalException.class, () -> mh.invoke(documentoLegalService, futureMock, "Produto X"));
}

private List<Produto> getFutureTask(Future<List<Produto>> future, String nomeProduto) {
    try {
        return future.get();
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new CapitalException("Thread interrompida ao obter tipo de produto: " + nomeProduto, e);
    } catch (ExecutionException e) {
        throw new CapitalException("Erro ao obter tipo de produto: " + nomeProduto, e.getCause());
    }
}
```

#### How to test void methods

```java

@Mock
private MyService myService;

@Test
void testSomething() {
    // ARRANGE
    var trackingBuyer = Tracking.builder()
        .identifier(tracking.getIdentifier())
        .deliveryInfo(tracking.getDeliveryInfo())
        .auditInformation(tracking.getAuditInformation())
        .buyer(Buyer.builder()
                    .buyerId("1313")
                    .legalDocumentNumber("00589076250001")
                    .fiscalType(PersonType.NATURAL_PERSON)
                    .build())
        .paymentInfo(tracking.getPaymentInfo())
        .orderDate(Instant.now())
        .flowType(tracking.getFlowType())
        .items(tracking.getItems())
        .build();

    doNothing().when(myService).receivePrePaidCardDelivery(tracking);

    // ACT
    myService.receivePrePaidCardDelivery(trackingBuyer);

    // ASSERT
    verify(myService).receivePrePaidCardDelivery(trackingBuyer);

}

```

### How to test exceptions

```java
@ExtendWith(MockitoExtension.class)
class EmbeddedProductConfigurationServiceTest {

    @Mock
    MessageService messages;

    @Mock
    EmbeddedProductConfigurationRepository embeddedProductConfigurationRepository;

    @Mock
    ProductFacade productFacade;

    @Mock
    DomainFacade domainFacade;

    @InjectMocks
    EmbeddedProductConfigurationService service;

    @Test
    void testProductConfigEmptyRules() {
        var body = new EmbeddedProductConfigurationRequest();
        body.setProductId("");
        body.setRules(Set.of());

        assertThrows(BusinessException.class, () -> service.createEmbeddedProductConfig(body));
    }

    @Test
    void testProductConfigValidRules() throws Exception {
        var dto = new EmbeddedProductConfigurationRequest();
        dto.setProductId("1s");
        dto.setRules(Set.of(Map.of("merchant_type", Set.of("internal"))));
        dto.setAuditInformation(new AuditInformation(Instant.now(), Instant.now()));
        dto.setSituation(new EmbeddedProductConfigurationStatus(EmbeddedProductStatus.ACTIVATED));
        BeanHelper.fillPrincipal(dto.getAuditInformation());

        var domainData = new DomainData();
        domainData.setCode("internal");
        when(domainFacade.findByType(anyString())).thenReturn(Optional.of(List.of(domainData)));
        when(productFacade.findProductById("1s")).thenReturn(Optional.of(buildProduct()));

        var entity = MapperHelper.convertDTOToEntity(dto, EmbeddedProductConfiguration.class);
        lenient().when(embeddedProductConfigurationRepository.save(Mockito.any(EmbeddedProductConfiguration.class))).thenReturn(entity);

        var resp = service.createEmbeddedProductConfig(dto);

        Assertions.assertNotNull(resp);
    }

    @Test
    void testAllowEmbedInvalid() {
        var dto = new EmbeddedProductConfigurationRequest();
        dto.setProductId("1s");
        dto.setRules(Set.of(Map.of("merchant_type", Set.of("internal"))));

        var product = buildProduct();
        var productServiceDomain = (ProductServiceDomain) product;
        productServiceDomain.setAllowsEmbedding(false);

        when(productFacade.findProductById("1s")).thenReturn(Optional.of(productServiceDomain));

        assertThrows(BusinessException.class, () -> service.createEmbeddedProductConfig(dto));
    }
}
```