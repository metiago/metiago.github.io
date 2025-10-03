---
title:  'Java Keytool - Quick References'
date: "2014-07-03"
draft: false

---

### Java Keytool

The Java Keytool is a command line tool which can generate public key / private key pairs and store them in a Java KeyStore. The Keytool executable is distributed with the Java SDK (or JRE), so if you have an SDK installed you will also have the Keytool executable. 

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

### Sun Microsystems Utility

This Java code is a utility that automates the process of downloading a server's SSL certificate and adding it to a Java KeyStore (jssecacerts). It's commonly used to handle SSL certificate issues in Java applications when connecting to a server with a certificate not yet trusted by the local Java runtime.


```java
/*
* Copyright 2006 Sun Microsystems, Inc. All Rights Reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions
* are met:
*
* - Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.
*
* - Redistributions in binary form must reproduce the above copyright
* notice, this list of conditions and the following disclaimer in the
* documentation and/or other materials provided with the distribution.
*
* - Neither the name of Sun Microsystems nor the names of its
* contributors may be used to endorse or promote products derived
* from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
* IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
* THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
* PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
* CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
* EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
* PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
* PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
* LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
* NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import javax.net.ssl.*;
import java.io.*;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

public class InstallCert {
    
    private static final char[] HEXDIGITS = "0123456789abcdef".toCharArray();

    private static final String HOST = "receitaws.com.br";
    
    private static final int PORT = 443;
    
    private static final String PASSWORD = "changeit";
    
    public static void main(String[] args) throws Exception {
        
        File file = new File("jssecacerts");
        
        if (file.isFile() == false) {
            
            char SEP = File.separatorChar;
            
            File dir = new File(System.getProperty("java.home") + SEP + "lib" + SEP + "security");
            
            file = new File(dir, "jssecacerts");
            
            if (file.isFile() == false) {
                
                file = new File(dir, "cacerts");
            }
        }
        
        System.out.println("Loading KeyStore " + file + "...");
        
        InputStream in = new FileInputStream(file);
        
        KeyStore ks = KeyStore.getInstance(KeyStore.getDefaultType());        
        ks.load(in, PASSWORD.toCharArray());
        in.close();
        
        SSLContext context = SSLContext.getInstance("TLS");
        
        TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init(ks);
        
        X509TrustManager defaultTrustManager = (X509TrustManager) tmf.getTrustManagers()[0];
        
        SavingTrustManager tm = new SavingTrustManager(defaultTrustManager);
        context.init(null, new TrustManager[]{tm}, null);
        
        SSLSocketFactory factory = context.getSocketFactory();
        
        System.out.println("Opening connection to " + HOST + ":" + PORT + "...");
        
        SSLSocket socket = (SSLSocket) factory.createSocket(HOST, PORT);
        
        socket.setSoTimeout(10000);
        
        try {
            
            System.out.println("Starting SSL handshake...");
            socket.startHandshake();
            socket.close();
            System.out.println();
            System.out.println("No errors, certificate is already trusted");
            
        } 
        catch (SSLException e) {
            System.out.println();
            e.printStackTrace(System.out);
        }
        
        X509Certificate[] chain = tm.chain;
        
        if (chain == null) {
            
            System.out.println("Could not obtain server certificate chain");
            return;
        }
        
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        System.out.println();
        System.out.println("Server sent " + chain.length + " certificate(s):");
        System.out.println();
        MessageDigest sha1 = MessageDigest.getInstance("SHA1");
        MessageDigest md5 = MessageDigest.getInstance("MD5");
        for (int i = 0; i < chain.length; i++) {
            X509Certificate cert = chain[i];
            System.out.println(" " + (i + 1) + " Subject " + cert.getSubjectDN());
            System.out.println(" Issuer " + cert.getIssuerDN());
            sha1.update(cert.getEncoded());
            System.out.println(" sha1 " + toHexString(sha1.digest()));
            md5.update(cert.getEncoded());
            System.out.println(" md5 " + toHexString(md5.digest()));
            System.out.println();
        }
        
        System.out.println("Enter certificate to add to trusted keystore or 'q' to quit: [1]");
        
        String line = reader.readLine().trim();
        int k;
        try {
            k = (line.length() == 0) ? 0 : Integer.parseInt(line) - 1;
        } catch (NumberFormatException e) {
            System.out.println("KeyStore not changed");
            return;
        }
        
        X509Certificate cert = chain[k];
        String alias = HOST + "-" + (k + 1);
        ks.setCertificateEntry(alias, cert);
        OutputStream out = new FileOutputStream("jssecacerts");
        ks.store(out, PASSWORD.toCharArray());
        out.close();
        System.out.println();
        System.out.println(cert);
        System.out.println();
        System.out.println("Added certificate to keystore 'jssecacerts' using alias '"
                + alias + "'");
    }  

    private static String toHexString(byte[] bytes) {
        
        StringBuilder sb = new StringBuilder(bytes.length * 3);
        
        for (int b : bytes) {
            b &= 0xff;
            sb.append(HEXDIGITS[b >> 4]);
            sb.append(HEXDIGITS[b & 15]);
            sb.append(' ');
        }
        
        return sb.toString();
    }

    private static class SavingTrustManager implements X509TrustManager {

        private final X509TrustManager tm;
        private X509Certificate[] chain;

        SavingTrustManager(X509TrustManager tm) {
            this.tm = tm;
        }

        @Override
        public X509Certificate[] getAcceptedIssuers() {
            throw new UnsupportedOperationException();
        }

        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType)
                throws CertificateException {
            throw new UnsupportedOperationException();
        }

        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType)
                throws CertificateException {
            this.chain = chain;
            tm.checkServerTrusted(chain, authType);
        }
    }
}

```
