---
title: "Mockito Unit Tests"
date: 2022-04-27T15:14:28-03:00
draft: false
---

Mockito is a popular mocking framework for Java that allows developers to create mock objects in automated unit tests. Mock objects simulate the behavior of real objects in controlled ways, enabling developers to isolate the code under test and verify its behavior in various scenarios.

When using Mockito with Spring Boot, you can easily write unit tests for your Spring components (such as controllers, services, and repositories) by mocking dependencies and defining the expected behavior of those mocks.

Here's a basic example of how you might use Mockito in a Spring Boot application:

```java
@Service
public class EmbeddedProductConfigurationService {

    private final MessageService messages;

    private final EmbeddedProductConfigurationRepository embeddedProductConfigurationRepository;

    private final ProductFacade productFacade;

    private final DomainFacade domainFacade;

    public EmbeddedProductConfigurationService(MessageService messages, EmbeddedProductConfigurationRepository embeddedProductConfigurationRepository, ProductFacade productFacade, DomainFacade domainFacade) {
        this.messages = messages;
        this.embeddedProductConfigurationRepository = embeddedProductConfigurationRepository;
        this.productFacade = productFacade;
        this.domainFacade = domainFacade;
    }

    public EmbeddedProductConfiguration createEmbeddedProductConfig(EmbeddedProductConfiguration reqBody) throws Exception{

        validateRequestPayload(reqBody);

        reqBody.setAuditInformation(new AuditInformation(Instant.now(), Instant.now()));
        reqBody.setStatus(new EmbeddedProductConfigurationStatus(EmbeddedProductStatus.ACTIVATED));
        BeanHelper.fillPrincipal(reqBody.getAuditInformation());

        Optional<Product> product = productFacade.findProductById(reqBody.getProductId());

        if (product.isPresent() && canEmbed(product.get())) {
            validateRuleKeys(reqBody);
            validateRuleValues(reqBody);
            validateExistingRules(reqBody);
            return embeddedProductConfigurationRepository.save(reqBody);
        }

        throw new BusinessException(messages.getMessage("error.embedded.product.invalid"));
    }

    private void validateRequestPayload(EmbeddedProductConfiguration reqBody) {

        if (StringUtils.isBlank(reqBody.getProductId())) {
            throw new BusinessException(messages.getMessage("error.embedded.product.config.product_id"));
        }

        if (CollectionUtils.isEmpty(reqBody.getRules())) {
            throw new BusinessException(messages.getMessage("error.embedded.product.config.rules"));
        }

        if (reqBody.getRules().stream().anyMatch(CollectionUtils::isEmpty)) {
            throw new BusinessException(messages.getMessage("error.embedded.product.config.rules.config"));
        }
    }

    private boolean canEmbed(Product product) {
        if (product instanceof ProductServiceDomain) {
            var serviceDomain = (ProductServiceDomain) product;
            return product.getSituation().getStatus().equals(ProductStatus.ACTIVE) && serviceDomain.getAllowsEmbedding();
        }
        return false;
    }

    private void validateExistingRules(EmbeddedProductConfiguration reqBody) {
        Set<String> existingRules = embeddedProductConfigurationRepository.findByProductId(reqBody.getProductId(),
                        EmbeddedProductStatus.ACTIVATED)
                .stream()
                .flatMap(List::stream)
                .flatMap(e -> e.getRules().stream())
                .flatMap(rules -> rules.values().stream())
                .flatMap(Set::stream)
                .collect(Collectors.toSet());

        for(Map<String, Set<String>> rules: reqBody.getRules()) {
            for (Map.Entry<String, Set<String>> rule : rules.entrySet()) {
                for(String value: rule.getValue()) {
                    if (!existingRules.isEmpty() && existingRules.contains(value)) {
                        throw new BusinessException(messages.getMessage("error.embedded.product.config.exists"));
                    }
                }
            }
        }
    }

    private void validateRuleKeys(EmbeddedProductConfiguration reqBody) {
        Optional<List<DomainData>> domains = domainFacade.getEmbeddedProductRules();
        if (domains.isPresent()) {
            var isKeysValid = reqBody.getRules().stream()
                    .flatMap(map -> map.keySet().stream())
                    .allMatch(key -> domains.get().stream().anyMatch(domainData -> key.equals(domainData.getCode())));

            if (!isKeysValid) {
                throw new BusinessException(messages.getMessage("error.embedded.product.wrong.config.rules"));
            }
        }
    }

    private void validateRuleValues(EmbeddedProductConfiguration reqBody) {

        for(Map<String, Set<String>> rules: reqBody.getRules()) {
            for(Map.Entry<String, Set<String>> rule : rules.entrySet()) {
                var domains = domainFacade.findByType(rule.getKey()).orElse(List.of()).stream().map(DomainData::getCode).collect(Collectors.toList());
                for(String value: rule.getValue()) {
                    if (!domains.contains(value)) {
                        throw new BusinessException(messages.getMessage("error.embedded.product.wrong.config.rules"));
                    }
                }
            }
        }
    }
}
```

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
    void testValidConstructor() {
        var service = new EmbeddedProductConfigurationService(messages, embeddedProductConfigurationRepository, productFacade, domainFacade);
        Assertions.assertNotNull(messages);
        Assertions.assertNotNull(embeddedProductConfigurationRepository);
        Assertions.assertNotNull(productFacade);

        Assertions.assertNotNull(service);
    }

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

    @Test
    void testAllowEmbedValid() throws Exception {

        var dto = new EmbeddedProductConfigurationRequest();
        dto.setProductId("1s");
        dto.setRules(Set.of(Map.of("merchant_type", Set.of("internal"))));

        var domainData = new DomainData();
        domainData.setCode("internal");
        when(domainFacade.findByType("merchant_type")).thenReturn(Optional.of(List.of(domainData)));

        var product = buildProduct();
        var productServiceDomain = (ProductServiceDomain) product;
        productServiceDomain.setAllowsEmbedding(true);
        when(productFacade.findProductById("1s")).thenReturn(Optional.of(product));

        var entity = MapperHelper.convertDTOToEntity(dto, EmbeddedProductConfiguration.class);
        lenient().when(embeddedProductConfigurationRepository.save(Mockito.any(EmbeddedProductConfiguration.class))).thenReturn(entity);

        var resp = service.createEmbeddedProductConfig(dto);

        Assertions.assertNotNull(resp);
    }

    @Test
    void testRuleKeysValid() throws Exception {
        var dto = new EmbeddedProductConfigurationRequest();
        dto.setProductId("1s");
        dto.setRules(Set.of(Map.of("merchant_type", Set.of("internal"))));

        var domainData = new DomainData();
        domainData.setCode("internal");
        when(domainFacade.findByType("merchant_type")).thenReturn(Optional.of(List.of(domainData)));

        var product = buildProduct();
        var productServiceDomain = (ProductServiceDomain) product;
        productServiceDomain.setAllowsEmbedding(true);
        when(productFacade.findProductById("1s")).thenReturn(Optional.of(product));

        var entity = MapperHelper.convertDTOToEntity(dto, EmbeddedProductConfiguration.class);
        lenient().when(embeddedProductConfigurationRepository.save(Mockito.any(EmbeddedProductConfiguration.class))).thenReturn(entity);

        var resp = service.createEmbeddedProductConfig(dto);

        Assertions.assertNotNull(resp);
    }

    @Test
    void testRuleKeysInvalid() {

        var dto = new EmbeddedProductConfigurationRequest();
        dto.setProductId("1s");
        dto.setRules(Set.of(Map.of("example", Set.of("internal"))));

        var domainData = new DomainData();
        domainData.setCode("merchant_type");
        when(domainFacade.getEmbeddedProductRules()).thenReturn(Optional.of(List.of(domainData)));

        var product = buildProduct();
        var productServiceDomain = (ProductServiceDomain) product;
        productServiceDomain.setAllowsEmbedding(true);
        when(productFacade.findProductById("1s")).thenReturn(Optional.of(product));

        assertThrows(BusinessException.class, () -> service.createEmbeddedProductConfig(dto));
    }

    @Test
    void testRuleValuesValid() throws Exception {
        var dto = new EmbeddedProductConfigurationRequest();
        dto.setProductId("1s");
        dto.setRules(Set.of(Map.of("merchant_type", Set.of("internal"))));

        var domainData = new DomainData();
        domainData.setCode("merchant_type");
        when(domainFacade.getEmbeddedProductRules()).thenReturn(Optional.of(List.of(domainData)));

        domainData = new DomainData();
        domainData.setCode("internal");
        when(domainFacade.findByType("merchant_type")).thenReturn(Optional.of(List.of(domainData)));

        var product = buildProduct();
        var productServiceDomain = (ProductServiceDomain) product;
        productServiceDomain.setAllowsEmbedding(true);
        when(productFacade.findProductById("1s")).thenReturn(Optional.of(product));

        var entity = MapperHelper.convertDTOToEntity(dto, EmbeddedProductConfiguration.class);
        lenient().when(embeddedProductConfigurationRepository.save(Mockito.any(EmbeddedProductConfiguration.class))).thenReturn(entity);

        var resp = service.createEmbeddedProductConfig(dto);

        Assertions.assertNotNull(resp);
    }

    @Test
    void testRuleValuesInvalid() {

        var dto = new EmbeddedProductConfigurationRequest();
        dto.setProductId("1s");
        dto.setRules(Set.of(Map.of("example", Set.of("internal"))));

        var domainData = new DomainData();
        domainData.setCode("merchant_type");

        when(domainFacade.findByType("example")).thenReturn(Optional.of(List.of(domainData)));

        var product = buildProduct();
        var productServiceDomain = (ProductServiceDomain) product;
        productServiceDomain.setAllowsEmbedding(true);
        when(productFacade.findProductById("1s")).thenReturn(Optional.of(product));

        assertThrows(BusinessException.class, () -> service.createEmbeddedProductConfig(dto));
    }

    @Test
    void testDifferentRuleValuesValid() throws Exception {
        var dto = new EmbeddedProductConfigurationRequest();
        dto.setProductId("1s");
        dto.setRules(Set.of(Map.of("merchant_type", Set.of("internal"))));

        EmbeddedProductConfiguration config = new EmbeddedProductConfiguration();
        config.setRules(Set.of(Map.of("order_type", Set.of("external"))));

        var domainData = new DomainData();
        domainData.setCode("internal");
        when(domainFacade.findByType("merchant_type")).thenReturn(Optional.of(List.of(domainData)));
        when(embeddedProductConfigurationRepository.findByProductId(dto.getProductId(), EmbeddedProductStatus.ACTIVATED))
                .thenReturn(Optional.of(List.of(config)));

        var product = buildProduct();
        var productServiceDomain = (ProductServiceDomain) product;
        productServiceDomain.setAllowsEmbedding(true);
        when(productFacade.findProductById("1s")).thenReturn(Optional.of(product));

        var entity = MapperHelper.convertDTOToEntity(dto, EmbeddedProductConfiguration.class);
        lenient().when(embeddedProductConfigurationRepository.save(Mockito.any(EmbeddedProductConfiguration.class))).thenReturn(entity);

        var resp = service.createEmbeddedProductConfig(dto);

        Assertions.assertNotNull(resp);
    }

    @Test
    void testExistingRulesSameProductInvalid() {

        var dto = new EmbeddedProductConfigurationRequest();
        dto.setProductId("1s");
        dto.setRules(Set.of(Map.of("merchant_type", Set.of("internal"))));

        EmbeddedProductConfiguration config = new EmbeddedProductConfiguration();
        config.setRules(Set.of(Map.of("merchant_type", Set.of("internal"))));

        var domainData = new DomainData();
        domainData.setCode("internal");
        when(domainFacade.findByType("merchant_type")).thenReturn(Optional.of(List.of(domainData)));
        when(embeddedProductConfigurationRepository.findByProductId(dto.getProductId(), EmbeddedProductStatus.ACTIVATED))
                .thenReturn(Optional.of(List.of(config)));

        var product = buildProduct();
        var productServiceDomain = (ProductServiceDomain) product;
        productServiceDomain.setAllowsEmbedding(true);
        when(productFacade.findProductById("1s")).thenReturn(Optional.of(product));

        assertThrows(BusinessException.class, () -> service.createEmbeddedProductConfig(dto));
    }

    @Test
    void testGetAllEmbeddedProductConfiguration() throws Exception {

        var dto = new EmbeddedProductConfigurationRequest();
        dto.setProductId("1s");
        dto.setRules(Set.of(Map.of("merchant_type", Set.of("internal"))));

        var entity = new EmbeddedProductConfiguration();
        BeanUtils.copyProperties(dto, entity);

        var entityRules = List.of(entity);
        var pageable = PageRequest.of(0, 1);
        var entityPage = new PageImpl<>(entityRules, pageable, entityRules.size());
        when(embeddedProductConfigurationRepository.findAllByStatus(EmbeddedProductStatus.ACTIVATED, pageable)).thenReturn(entityPage);

        var resp = service.getAllEmbeddedProductConfiguration(pageable);

        Assertions.assertNotNull(resp);
        Assertions.assertEquals(entityRules.size(), resp.getSize());
    }

    public Product buildProduct() {
        var product = new ProductServiceDomain();
        product.setDescription(RandomHelper.generateUUID());
        product.setName("My Product");
        product.setPhoneSupportGetnetIncluded(Boolean.TRUE);
        product.setAuditInformation(new AuditInformationBuilder().withChannelData(new ChannelDataBuilder().any().build()).withCreationDate(Instant.now().truncatedTo(ChronoUnit.MILLIS)).withUpdateDate(Instant.now().truncatedTo(ChronoUnit.MILLIS)).build());
        product.setSituation(new ProductSituation(ProductStatus.ACTIVE));
        product.setServiceType(ServiceType.SERVICE);
        product.setProductConfiguration(new ProductConfiguration(KeywordType.IATA));
        product.setPricingModel(new PricingTypeNoPrice());
        product.setAllowsEmbedding(true);
        return product;
    }
}
```