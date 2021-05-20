---
layout: post
title:  Java JDK Key Tool
date:   2019-03-02 20:18:00 +0100
category: Dev
tags: java keystore
---


#### Concept

The Java Keytool is a command line tool which can generate public key / private key pairs and store them in a Java KeyStore. The Keytool executable is distributed with the Java SDK (or JRE), so if you have an SDK installed you will also have the Keytool executable. 

#### References

```bash
# GENERATE A SELF SIGNED CERTIFICATE 
keytool -genkey -alias 'myalias' -keyalg RSA -keysize 2048 -keystore yoursite.jks -storepass '12345' -keypass '6789'

# EXPORT A CERTIFICATE FROM A JKS
keytool -export -alias selfsigned -keystore keystore.jks -rfc -file X509_certificate.cer

# LIST JKS DATA
keytool -v -list -storetype pkcs12 -keystore equipamento.pfx

# GENERATE JKS FROM PFX
keytool -alias p3za8tyicxy755kio0ofdrsn4ci= -importkeystore -srckeystore equipamento_a1.pfx -srcstoretype pkcs12 -destkeystore clientcert.jks -deststoretype JKS

# EXPORT KEYSTORE TO CER
keytool -export -alias p3za8tyicxy755kio0ofdrsn4ci= -file client.cer -keystore clientcert.jks

# CREATE JKS TRUSTSTORE FROM CER FILE
keytool -import -trustcacerts -alias p3za8tyicxy755kio0ofdrsn4ci= -file public.cer -keystore truststore.jks

# IMPORT TRUSTSTORE TO JVM
keytool -import -alias p3za8tyicxy755kio0ofdrsn4ci= -keystore "C:\Program Files\Java\jdk1.8.0_45\jre\lib\security\cacerts" -storepass changeit -file truststore.jks

# DELETE ALIAS FROM JVM
keytool -delete -alias p3za8tyicxy755kio0ofdrsn4ci= -keystore "C:\Program Files\Java\jdk1.8.0_45\jre\lib\security\cacerts"

keytool -import -alias p3za8tyicxy755kio0ofdrsn4ci= -keystore cacerts -file vip_cert.der

keytool -keystore new_identity_keystore.jks -storepass jkgbseMM@@387 -storetype JKS -keypass jkgbseMM@@387 -alias server -certfile tempcertfile.crt -keyfile your_domain_name.key-keyfilepass jkgbseMM@@387

keytool -import -trustcacerts -alias certAlias -file client.cer -keystore truststore.jks
```

