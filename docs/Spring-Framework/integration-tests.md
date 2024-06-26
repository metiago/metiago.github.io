---
title: "Spring Boot Integration Tests"
date: 2022-04-27T15:14:28-03:00
draft: false
---

Spring Boot 2 integration tests sample.

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