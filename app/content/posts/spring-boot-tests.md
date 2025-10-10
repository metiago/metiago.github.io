---
title: "Test - Quick Reference"
date: "2024-07-03"
draft: false

---

## Mockito

Mockito is a popular mocking framework for Java that allows developers to create mock objects in automated unit tests.

### Basic Concepts

- **Mocks**: Mocks are objects that simulate the behavior of real objects in a controlled way. They are used to verify interactions between the code under test and its dependencies. Mocks can be configured to return specific values when certain methods are called, and they can also record how they were interacted with, allowing you to assert that certain methods were called with specific arguments.

- **Stubs**: Stubs are simpler than mocks and are primarily used to provide predefined responses to method calls during tests. They do not track interactions or verify how they were used; their main purpose is to supply data needed for the test to run.

### Unit Tests

#### How to test private methods
```java
// Method under testing
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

@Test
void testSomeException() throws Throwable {

    when(futureMock.get()).thenThrow(new CapitalException("Erro ao obter tipoProduto: Produto X"));

    MethodHandles.Lookup lookup = MethodHandles.privateLookupIn(DocumentoLegalService.class, MethodHandles.lookup());
    MethodType mt = MethodType.methodType(List.class, Future.class, String.class);
    MethodHandle mh = lookup.findVirtual(DocumentoLegalService.class, "getFutureTask", mt);

    assertThrows(CapitalException.class, () -> mh.invoke(documentoLegalService, futureMock, "Produto X"));
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

#### How to test exceptions

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

### Integration Tests

```java

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertSame;

@SpringBootTest(classes = App.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AdapterPaymentPluginControllerITest {

    @LocalServerPort
    int port;

    final String path = "/adapter-payments-plugins/";

    @Autowired
    TestRestTemplate restTemplate;

    String accessToken;

    @BeforeEach
    void setUp() throws JsonProcessingException {
        var u = "https://example.com/v1/token";
        var clientId = "";
        var secret = "";
        var channel = "";
        var scope = "read";
        var h = new HttpHeaders();
        h.setAll(Map.of("client_id", clientId, "client_secret", secret, "channel", channel, "scope", scope));
        h.setContentType(MediaType.APPLICATION_JSON);
        var b = "{\"name\": \"tiago\", \"login\": \"username\", \"system\": \"\", \"scope\": \"\"}";
        var e = new HttpEntity<>(b, h);
        var r = restTemplate.exchange(u, HttpMethod.POST, e, String.class);
        accessToken = (String) new ObjectMapper().readValue(r.getBody(), Map.class).get("access_token");
    }

    @Test
    void testEndpointForbidden() {
        String url = "http://localhost:" + port + path + "/1";

        var res = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(null, null), String.class);

        assertThat(res).isNotNull();
        assertSame(HttpStatus.FORBIDDEN, res.getStatusCode());
    }

    @Test
    void testEndpointNotFound() {
        String url = "http://localhost:" + port + path + "/1";
        var headers = new HttpHeaders();
        headers.setAll(Map.of("Authorization", accessToken));
        headers.setContentType(MediaType.APPLICATION_JSON);

        var res = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(null, headers), String.class);

        assertThat(res).isNotNull();
        assertSame(HttpStatus.NOT_FOUND, res.getStatusCode());
    }
}
```
