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
