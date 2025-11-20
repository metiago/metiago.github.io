---
title: "Spring Testing Quick Reference: Essential Tips for Seamless Unit and Integration Testing"
date: "2024-07-03"
draft: false
---

In this blog post, we'll explore how to effectively write integration tests for a Spring Boot controller using the `TestRestTemplate`. 
This approach allows developers to test the full stack of a web application, ensuring that the endpoints behave as expected.

## Key Components

### Setup of the Integration Test

In our example, we are testing the `AdapterPaymentPluginController`. The class is annotated with `@SpringBootTest`, which allows Spring to load the full application context for testing. We're using a random port to avoid conflicts with other applications.

### Code Breakdown

```java
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
        var clientId = ""; // specify client id
        var secret = ""; // specify secret key
        var channel = ""; // specify channel
        var scope = "read";
        
        var h = new HttpHeaders();
        h.setAll(Map.of("client_id", clientId, "client_secret", secret, "channel", channel, "scope", scope));
        h.setContentType(MediaType.APPLICATION_JSON);
        
        var b = "{\"name\": \"tiago\", \"login\": \"username\", \"system\": \"\", \"scope\": \"\"}";
        var e = new HttpEntity<>(b, h);
        
        var r = restTemplate.exchange(u, HttpMethod.POST, e, String.class);
        accessToken = (String) new ObjectMapper().readValue(r.getBody(), Map.class).get("access_token");
    }
```

### Explanation:

- **Dependency Injection**: `@Autowired` is used to inject necessary components, such as `TestRestTemplate`, which allows sending HTTP requests to the server during tests.
- **Token Acquisition**: The `setUp` method fetches an access token from a mock authorization server. It constructs the headers and body of the request for the token retrieval.

### Testing Scenarios

#### 1. Testing Forbidden Access

```java
@Test
void testEndpointForbidden() {
    String url = "http://localhost:" + port + path + "/1";
    
    var res = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(null, null), String.class);

    assertThat(res).isNotNull();
    assertSame(HttpStatus.FORBIDDEN, res.getStatusCode());
}
```

- This test checks that accessing the endpoint without proper authorization returns a **FORBIDDEN** status code. It confirms that the application is secured as intended.

#### 2. Testing Not Found Scenario

```java
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
```

- This test simulates accessing a valid endpoint with an authorization token but targeting an entity that does not exist (hence a **NOT FOUND** status). It ensures that the application handles such scenarios gracefully.

## Conclusion

Writing integration tests for Spring Boot controllers helps ensure that your application behaves correctly under various conditions. By leveraging `TestRestTemplate`, we can simulate HTTP requests and verify responses effectively. The structure shown demonstrates how to set up tests for both forbidden access and handling non-existent resources. 

This testing methodology is essential for maintaining the integrity of your application as it evolves.