---
title: "Testing Application Controllers in Spring Boot"
date: "2025-04-12"
draft: false
---

In this post, I'm sharing examples of how to test the controller layer of your Spring Boot application. 

```java
@WebMvcTest(DocumentoLegalController.class)
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
class DocumentoLegalControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    DocumentoLegalService documentoLegalService;

    @Test
    void quando_parametro_documento_invalido_entao_deve_retornar_excecao() {

        var suid = "200.300.233-54";

        var exception = assertThrows(
                ServletException.class, () -> mockMvc.perform(get(String.format("/informe?documento=%s&ano=%d", suid, nextInt(1, 4))))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.documento").value(suid))
        );
        assertTrue(exception.getMessage().contains("must be a valid CPF (11 digits) or CNPJ (14 digits or alphanumeric)"));
    }

    @Test
    void quando_parametro_documento_valido_entao_nao_deve_subir_excecoes() throws Exception {

        var suid = nextIndividualSuid();

        mockMvc.perform(get(String.format("/informe?documento=%s&ano=%s", suid, "")))
                .andExpect(status().is4xxClientError());
    }

    @Test
    public void quando_parametros_validos_entao_deve_retornar_200() throws Exception {

        var suid = nextIndividualSuid();
        var ano = nextInt(1, 4);
        var fixture = new InformeRendimentoFixture();
        var jsonResposta = new ObjectMapper().writeValueAsString(paraDTO(fixture.documento));

        when(documentoLegalService.obterInformeRendimento(suid, ano)).thenReturn(paraDTO(fixture.documento));

        mockMvc.perform(get(String.format("/informe?documento=%s&ano=%s", suid, ano))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json(jsonResposta));
    }
}
```