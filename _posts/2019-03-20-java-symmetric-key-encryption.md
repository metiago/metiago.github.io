---
layout: default
title:  Java Symmetric Key Encryption
date:   2019-03-30 20:18:00 +0100
category: Dev
---

## Symmetric Key Encryption


#### Concept

Symmetric encryption is a type of encryption where only one key (a secret key) is used to both encrypt and decrypt electronic information. The entities communicating via symmetric encryption must exchange the key so that it can be used in the decryption process. This encryption method differs from asymmetric encryption where a pair of keys, one public and one private, is used to encrypt and decrypt messages.

Advantages

1. It is simpler and faster.
1. The two parties exchange the key in a secure way.

Drawback

The major drawback of symmetric cryptography is that if the key is leaked to the intruder, the message can be easily changed and this is considered as a risk factor.


#### Example

```bash

package com.ctw.crypto;

import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class CryptoExample {

    public static String encrypt(byte[] key, byte[] initVector, String value) throws Exception {
        
        IvParameterSpec iv = new IvParameterSpec(initVector);
        SecretKeySpec skeySpec = new SecretKeySpec(key, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        cipher.init(Cipher.ENCRYPT_MODE, skeySpec, iv);

        byte[] encrypted = cipher.doFinal(value.getBytes("UTF-8"));
        String encoded = Base64.getEncoder().encodeToString(encrypted);
        return encoded;
    }

    public static String decrypt(byte[] key, byte[] initVector, String encrypted) throws Exception {

        IvParameterSpec iv = new IvParameterSpec(initVector);
        SecretKeySpec skeySpec = new SecretKeySpec(key, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
        cipher.init(Cipher.DECRYPT_MODE, skeySpec, iv);

        byte[] original = cipher.doFinal(Base64.getDecoder().decode(encrypted));
        return new String(original);
    }

    private static String bytesToHex(byte[] bytes) {

        StringBuilder sb = new StringBuilder();

        for (byte b : bytes) {
            sb.append(String.format("%02X ", b));
        }

        return sb.toString();
    }
    
    public static void main(String[] args) {
        
        try {                 

            SecureRandom sr = new SecureRandom();
            byte[] key = new byte[16];
            sr.nextBytes(key); // 128 bit key
            byte[] initVector = new byte[16];
            sr.nextBytes(initVector); // 16 bytes IV
            
            String payload = "This is the plaintext from Erik and Milton's article.";
            System.out.println("Original text: " + payload);

            String encrypted = encrypt(key, initVector, payload);
            System.out.println("Encrypted text: " + encrypted);

            String decrypted = decrypt(key, initVector, encrypted);
            System.out.println("Decrypted text: " + decrypted);

            String result = decrypted.equals(payload) ? "Done!" : "Error.";
            System.out.println(result);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```

