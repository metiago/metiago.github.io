---
layout: post
title:  Aggregates and Aggregate Roots (DDD)
date:   2017-08-18 20:18:00 +0100
category: Dev
tags: ddd java design
---

An aggregate is a group (a cluster) of objects that work together and are treated as a unit, to provide a specific functionality. When trying to form aggregates, the rule `is part of` that may help make the decision.

In the example below we have two JPA entities representing database objects. The `Version` object contains details
about a new version for a fictitious software and the `Issue` object represents the lisf of issues this version will fix.

```java
@Entity
@Table(name = "t910fixv", uniqueConstraints = {@UniqueConstraint(columnNames = "ds_fxv", name = "UK_T910FIXV_DSFXV")})
public class Version implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "t910fixv_gen")
    @SequenceGenerator(sequenceName = "t910fixv_seq", allocationSize = 1, name = "t910fixv_gen")
    @Column(name = "id_fxv")
    private Long idFxv;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "PST")
    @DateFuture(message = "A data de solicitação deve ser posterior a data de hoje")
    @NotNull(message = "A data de expedição deve ser preenchido")
    @Column(name = "dt_exp")
    @Temporal(TemporalType.DATE)
    private Date dtExp;

    @Column(name = "ds_fxv")
    private String dsFxv;

    @Temporal(TemporalType.DATE)
    @Column(name = "dt_sol")
    private Date dtSol;

    @Temporal(TemporalType.DATE)
    @Column(name = "dt_cri")
    private Date dtCri = new Date();

    @Column(name = "nr_ver_pdr")
    private String nrVerPdr;

    @Column(name = "sat")
    private boolean sat;

    @Column(name = "id_sit")
    @Enumerated(EnumType.STRING)
    private SituacaoFixVersionEnum idSit;

    @Column(name = "tipo")
    @Enumerated(EnumType.STRING)
    private TipoTemplate tipo;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "dh_apr_fix")
    private Date dhAprFix;

    @Column(name = "nr_ver")
    private String nrVer;

    @Column(name = "ds_mot_sol")
    private String dsMotSol;

    @Column(name = "nr_maj")
    private Integer nrMaj;

    @Column(name = "nr_min")
    private Integer nrMin;

    @Column(name = "nr_pat")
    private Integer nrPat;

    @ManyToOne
    @JoinColumn(name = "cd_usu_sol", nullable = false, foreignKey = @ForeignKey(name = "FK_T910VIXV_REF_T900USUA_01"))
    private User cdUserSol;

    @ManyToOne
    @JoinColumn(name = "cd_usu_cri", nullable = false, foreignKey = @ForeignKey(name = "FK_T910VIXV_REF_T900USUA_02"))
    private User cdUserCri;

    @ManyToOne
    @JoinColumn(name = "cd_usu_apr_fix", nullable = false, foreignKey = @ForeignKey(name = "FK_T910VIXV_REF_T900USUA_03"))
    private User userAprovadorFix;

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinTable(name = "t910fixv_issu", joinColumns =
    @JoinColumn(name = "id_fxv", referencedColumnName = "id_fxv", foreignKey = @ForeignKey(name = "FK_T910FIXV_REF_T910ISSU")), inverseJoinColumns =
    @JoinColumn(name = "id_iss", referencedColumnName = "id_iss"), foreignKey = @ForeignKey(name = "FK_T910ISSU_REF_T910FIXV"))
    private List<Issue> issues;

    @ManyToMany
    private Set<Produto> produtos;
```

```java
package io.github.metiago.domain.panel;

import io.github.metiago.domain.users.User;
import io.github.metiago.enums.TipoIssue;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "t910issu",
        uniqueConstraints = {@UniqueConstraint(columnNames = "nr_iss", name = "UK_T910ISSU_NRISS")})
public class Issue implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "t910issu_gen")
    @SequenceGenerator(sequenceName = "t910issu_seq", allocationSize = 1, name = "t910issu_gen")
    @Column(name = "id_iss")
    private Long idIss;

    @Column(name = "nr_iss", unique = true)
    private String nrIss;

    @Enumerated(EnumType.STRING)
    @Column(name = "ds_cat")
    private TipoIssue categoria;

    @Column(name = "ds_res_iss")
    private String dsResIss;

    @Column(name = "ds_inc")
    private String dsInc;

    @Column(name = "ds_sol")
    private String dsSol;

    @Column(name = "ti_zen")
    private String tiZen;

    @Column(name = "priv")
    private Boolean priv;

    @Column(name = "et_iss")
    private String etIss;

    @Column(name = "dc_cnf")
    private Boolean dcCnf;

    @ManyToOne
    @JoinColumn(name = "cd_usu_pla")
    private User planejador;

    @ManyToOne
    @JoinColumn(name = "id_prd")
    private Produto produto;

    @ManyToMany
    private List<FixVersion> fixVersions;

    @ManyToOne
    @JoinColumn(name = "id_cli")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "cd_usu_dsv")
    private User cdUsuDsv;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "issue", cascade = CascadeType.ALL)
    private List<ArquivoIssue> arquivoIssues; 
}
```

Having `Version` as our parent object and `Issue` as our children we can say that `Issue is part of Version` so tha `Version` is our root object
and all (CRUD) operation could be done through `VersionRepository` e.g

```java
public interface VersionRepository extends JpaRepository<Version, Long>, JpaSpecificationExecutor<Version> {

    @Query("FROM FixVersion f WHERE f.dsFxv = :dsFxv")
    FixVersion findUserByDsFixVersion(@Param("dsFxv") String dsFxv);


    @Query("FROM FixVersion fv WHERE fv.dsFxv = :dsFxv")
    FixVersion findByFixDescription(@Param("dsFxv") String name);


    @Query("FROM FixVersion fv WHERE fv.dtExp = :dataExp AND fv.idSit = :idSit ORDER BY fv.dsFxv DESC")
    List<FixVersion> findAllApprovedFixVersion(@Param("dataExp") Date dataExp, @Param("idSit") SituacaoFixVersionEnum fixVersionStatus);


    @Query("FROM Issue i WHERE i.nrIss = :nrIss")
    Issue findByIssueKey(@Param("nrIss") String issueKey);


    @Query("FROM DataRejeicaoFix d WHERE d.dtRej > :dataInicial")
    List<DataRejeicaoFix> buscaRejeicaoFixes(@Param("dataInicial") Date dataInicial);


    @Query("SELECT DISTINCT fv FROM FixVersion fv inner join fv.produtos p WHERE p.id = :pid " +
            "AND lower(fv.nrVer) = lower(:branch) " +
            "AND fv.idSit = :situacao " +
            "AND fv.dtExp > :dataExpedicao")
    List<FixVersion> buscaFixesNaBranchDoProduto(@Param("pid") Long id,
                                                 @Param("branch") String nrVer,
                                                 @Param("situacao") SituacaoFixVersionEnum aprovado,
                                                 @Param("dataExpedicao") Date dtExp);


    @Query("SELECT DISTINCT fv FROM FixVersion fv inner join fv.produtos p WHERE p.id = :pid " +
            "AND lower(fv.nrVer) = lower(:branch) " +
            "AND fv.idSit = :situacao ")
    List<FixVersion> buscaFixesNaBranchDoProduto(@Param("pid") Long id,
                                                 @Param("branch") String nrVer,
                                                 @Param("situacao") SituacaoFixVersionEnum aprovado);


    @Query("SELECT DISTINCT fv FROM FixVersion fv inner join fv.produtos p WHERE p.id = :pid " +
            "AND fv.idSit = :situacao " +
            "AND fv.dtExp > :dataExpedicao")
    List<FixVersion> buscaVersoesDoProduto(@Param("pid") Long pid,
                                           @Param("situacao") SituacaoFixVersionEnum aprovado,
                                           @Param("dataExpedicao") Date dtExp);


    @Query("SELECT DISTINCT fv FROM FixVersion fv inner join fv.produtos p WHERE p.id = :pid " +
            "AND fv.idSit = :situacao ")
    List<FixVersion> buscaVersoesDoProduto(@Param("pid") Long pid,
                                           @Param("situacao") SituacaoFixVersionEnum aprovado);


    @Query("SELECT DISTINCT fv FROM FixVersion fv inner join fv.produtos p WHERE p.id = :pid " +
            "AND fv.tipo = :tipo " +
            "AND fv.idSit = :situacao " +
            "AND fv.dtExp > :dataExpedicao")
    List<FixVersion> buscaVersoesExistenteAprovada(@Param("pid") Long pid,
                                                   @Param("situacao") SituacaoFixVersionEnum aprovado,
                                                   @Param("dataExpedicao") Date dtExp,
                                                   @Param("tipo") TipoTemplate tipo);


    @Query("SELECT DISTINCT fv FROM FixVersion fv inner join fv.produtos p WHERE p.id = :pid " +
            "AND fv.tipo = :tipo " +
            "AND (fv.idSit = :aprovada OR fv.idSit = :expedida)")
    List<FixVersion> buscaAprovadosExpedidos(@Param("pid") Long id,
                                             @Param("tipo") TipoTemplate tipo,
                                             @Param("aprovada") SituacaoFixVersionEnum aprovado,
                                             @Param("expedida") SituacaoFixVersionEnum expedido);


    @Query("SELECT DISTINCT fv FROM FixVersion fv inner join fv.produtos p " +
            "WHERE p.id = :pid " +
            "AND lower(fv.nrVer) = lower(:branch) " +
            "AND (fv.idSit = :aprovada OR fv.idSit = :expedida)")
    List<FixVersion> fixVersionsAprovadasOuExpedidasDaBranch(@Param("pid") Long id,
                                                             @Param("branch") String nrVer,
                                                             @Param("aprovada") SituacaoFixVersionEnum aprovado,
                                                             @Param("expedida") SituacaoFixVersionEnum expedido);


    @Query("SELECT DISTINCT fv FROM FixVersion fv inner join fv.produtos p WHERE p.id = :pid " +
            "AND fv.tipo = :tipo " +
            "AND fv.idSit = :situacao " +
            "AND fv.dtExp = :dataExpedicao")
    List<FixVersion> buscaFixesAprovadas(@Param("pid") Long pid,
                                         @Param("tipo") TipoTemplate tipo,
                                         @Param("situacao") SituacaoFixVersionEnum aprovado,
                                         @Param("dataExpedicao") Date dtExp);


    @Query("SELECT DISTINCT fv FROM FixVersion fv INNER JOIN fv.produtos p WHERE p.id = :pid " +
            "AND fv.tipo = :tipo " +
            "AND fv.idSit = :expedida " +
            "AND fv.nrMaj = :nrMaj " +
            "AND fv.nrMin = :nrMin")
    List<FixVersion> buscaVersaoExpedidaNaBranch(@Param("pid") Long id,
                                                 @Param("tipo") TipoTemplate tipo,
                                                 @Param("expedida") SituacaoFixVersionEnum expedido,
                                                 @Param("nrMaj") Integer majorVersion,
                                                 @Param("nrMin") Integer minorVersion);

    @Query("FROM FixVersion fv WHERE fv.idSit <> :idSit")
    List<FixVersion> findAll(@Param("idSit") SituacaoFixVersionEnum aprovado);
}
```

This pattern from Domain-Driven Design has many benefits when applying corretly and subtly on either MVC or Restful API.

You can find more information on [Domain-Driven Design Book](https://www.amazon.com/gp/product/0321125215/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0321125215&linkCode=as2&tag=martinfowlerc-20)