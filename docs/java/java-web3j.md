---
title:  'Blockchain - Web3j'
date: 2018-04-09T19:18:41-03:00
draft: false
---

Ethereum blockchain with Java & Web3j e.g.

### Prerequisites

1. [Java 8+](https://www.eclipse.org/openj9/)
1. [Web3j](http://web3j.io/)
1. [Solc](https://www.npmjs.com/package/solc)
1. [Maven](https://maven.apache.org/)
1. [Docker](https://www.docker.com/)
1. [Geth](https://geth.ethereum.org/)
1. [Ganache](https://www.trufflesuite.com/ganache)


### Geth

Before start running Java commands we need to set up a blockchain node
to execute our transactions.

This Dockerfile below spin up a simple geth node connecting to the Ropsten network, containing one main account and auto mining transactions. This node isn't ready for production use given that, production set ups is a bit more complex but all the Java implementation could be good to go.

All Java interaction will be against this node.

Create a file called `Dockerfile` wherever you want.

```bash
FROM ubuntu:bionic

MAINTAINER Tiago

RUN apt-get update \
     && apt-get install -y wget \
     && rm -rf /var/lib/apt/lists/*

WORKDIR "/opt"
ARG BINARY="geth-alltools-linux-amd64-1.7.3-4bb3c89d.tar.gz"
RUN wget "https://gethstore.blob.core.windows.net/builds/$BINARY"
RUN tar -xzvf $BINARY --strip 1
RUN rm $BINARY

EXPOSE 8545
EXPOSE 30303

ADD ./genesis.json ./genesis.json
RUN ./geth --datadir ./data init genesis.json

RUN echo "12345678" > ~/.account_password
RUN echo "20c33834cdfa7703b90d988e66e6bb6d1b89d66a394db2357dfcb7d1941c0ef3" > ~/.privatekey
RUN ./geth account import --datadir ~/.ethereum --password ~/.account_password ~/.privatekey

CMD exec ./geth --testnet --syncmode "fast" --txpool.accountslots 32 --txpool.globalslots 8192 --txpool.accountqueue 128 --txpool.globalqueue 4096 -cache 2048 --verbosity=4 --rpc --rpcaddr "0.0.0.0" --rpcport 8545 --rpccorsdomain="*" --mine --minerthreads=2 --rpcapi "db,eth,net,web3,personal,miner,admin,txpool,debug" --etherbase "0xda335e721279e12eec1c1cda1f86e47d7dd95825" --unlock "0xda335e721279e12eec1c1cda1f86e47d7dd95825" --password ~/.account_password
```

Now let's create `docker-compose.yml` file. This file is very useful during development phase, allowing us to create robust environment of nodes like databases, webservers, etc.

```yaml
version: '3.5'
services:
 geth-eth:
   container_name: 'geth-eth'
   image: geth
   build: './'
   restart: 'on-failure'
   ports:
     - '8545:8545'
     - '30303:30303'
   volumes:
     - /usr/local/wallet:/root/.ethereum/testnet/keystore
     - /usr/local/data:/root/.ethereum/testnet
```

Once we have our node running, while it's syncing, we're going write and compile a solidity contract. This contract will be deployed into Geth so that we can execute our blockchain transactions.

This contract represents a deal between an insurance company with their clients. The main account is the insurance admin which can define cars' mileages for their drivers.

Create this file called `PayByMileage.sol`.

```java
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.20;


contract PayByMileage {

    mapping(address => Insurance) balances;

    struct Insurance {
        address admin_account;
        int256 amount;
        address driver_account;
    }

    event mileageValue (address admin_account, address driver_account, int256 _mileage);

    event error (string err);

    constructor() {}

    function getBalance(address driver_account) public view returns (int256 balance) {
        return balances[driver_account].amount;
    }

    function defineMileage(address driver_account, int256 amount) public {
        Insurance memory i = balances[driver_account];
        i.driver_account = driver_account;
        i.amount = amount;
        balances[driver_account] = i;
        emit mileageValue(i.admin_account, i.driver_account, i.amount);
    }

    function subtractMileage(address driver_account, int256 amount) public {

        Insurance memory i = balances[driver_account];

        if (i.admin_account != msg.sender) {
            emit error("Driver account is different from owner");
        }

        if(amount <= 0) {
            emit error("Amount must be greater than 0");
        }
        
        i.admin_account = msg.sender;
        i.amount = balances[driver_account].amount - amount;
        balances[driver_account] = i;

        emit mileageValue(i.admin_account, i.driver_account, i.amount);
    }
}

```

Now let's compile our contract. This shell script below execute some steps to get our wrapper class.

```bash
#!/bin/bash

# compile the contract
solcjs PayByMileage.sol --bin --abi --optimize -o .

sleep 1

# renaming files
mv PayByMileage_sol_PayByMileage.abi PayByMileage.abi
mv PayByMileage_sol_PayByMileage.bin PayByMileage.bin

sleep 1

# create java wrapper class to invoke contract's methods
web3j generate solidity -b PayByMileage.bin -a PayByMileage.abi -o /Users/tiago/Desktop/my_project/src/main/java -p io.tiago.contract
```
Once we have our wrapper class we can start using it to execute transactions in our blockchain node. 

First let's create some utilities classes to keep our constants

```java

package io.tiago.pyg.domain.util;

import java.math.BigInteger;

public class Constants {

    public static final String NODE_URL = "http://localhost:8545";

    public static final String PRIVATE_KEY = "";

    public static final String CONTRACT_ADDRESS = "";

    public static final String WALLET_DIR = "/usr/local/";

    public static final String PASSWORD = "12345678";

    public static final String WALLET_FILE = "UTC--2019-04-10T03-11-49.894000000Z--da335e721279e12eec1c1cda1f86e47d7dd95825.json";

    public static final BigInteger GAS_LIMIT = BigInteger.valueOf(6721975);

    public static final BigInteger GAS_PRICE = BigInteger.valueOf(100000000000L);
}

```

```java
import java.io.IOException;
import java.util.Optional;

import org.web3j.crypto.CipherException;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthAccounts;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;

public class Web3jUtils {

    public static Web3j buildHttpClient(String url) {
        return Web3j.build(new HttpService(url));
    }

    /**
     * Returns the list of addresses owned by this client.
     */
    public static EthAccounts getAccounts(Web3j web3j) throws Exception {
        return web3j.ethAccounts().sendAsync().get();
    }

    /**
     * Returns the TransactionRecipt for the specified tx hash as an optional.
     */
    public static Optional<TransactionReceipt> getReceipt(Web3j web3j, String transactionHash) throws Exception {
        EthGetTransactionReceipt receipt = web3j.ethGetTransactionReceipt(transactionHash).sendAsync().get();
        return receipt.getTransactionReceipt();
    }

    public static Credentials getCredentials() throws CipherException, IOException {
        // Credentials credentials = Credentials.create(Constants.PRIVATE_KEY);
        Credentials credentials = WalletUtils.loadCredentials(Constants.PASSWORD, Constants.WALLET_DIR + Constants.WALLET_FILE);
        return credentials;
    }
}

```

Now we can write an example to deploy our contract, vide example below.

```java
import io.tiago.pyg.domain.contract.PayByMileage;
import io.tiago.pyg.domain.util.Constants;
import io.tiago.pyg.domain.util.Web3jUtils;
import org.web3j.crypto.CipherException;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

import java.io.IOException;


public class Main {

    private Credentials credentials;

    private Web3j web3;

    private PayByMileage contract;

    public Main() throws IOException, CipherException {
        this.credentials = Web3jUtils.getCredentials();
        this.web3 = Web3j.build(new HttpService(Constants.NODE_URL));
        this.contract = PayByMileage.load(Constants.CONTRACT_ADDRESS, web3, credentials, Constants.GAS_PRICE, Constants.GAS_LIMIT);
    }

    public static void main(String[] args) throws Exception {
        Main c = new Main();
        c.deploy();
    }

    private void deploy() throws Exception {
        System.out.println("Deploying Contract...");
        PayByMileage c = PayByMileage.deploy(this.web3, credentials, Constants.GAS_PRICE, Constants.GAS_LIMIT).send();
        System.out.println("Contract Address: " + c.getContractAddress());
        System.out.println("Contract Valid: " + c.isValid());
    }
}
 
```

Running this code we'll get an output like below. Once you have the contract address you should update `CONTRACT_ADDRESS` variable in the `Constants.java` file.

```bash
Deploying Contract...
Contract Address: 0xeab922510bd499252e9fbafc2ab16dfc136170a7
Contract Valid: true
```

Now we can start executing transactions.

```java

public class Main {

    private Credentials credentials;

    private Web3j web3;

    private PayByMileage contract;

    public Main() throws IOException, CipherException {
        this.credentials = Web3jUtils.getCredentials();
        this.web3 = Web3j.build(new HttpService(Constants.NODE_URL));
        this.contract = PayByMileage.load(Constants.CONTRACT_ADDRESS, web3, credentials, Constants.GAS_PRICE, Constants.GAS_LIMIT);
    }

    public static void main(String[] args) throws Exception {
        Main c = new Main();
        c.getBalance();
    }


    /** get the current balance of the last block for a given account **/
    private void getBalance() throws Exception {
        EthGetBalance balanceResult = web3.ethGetBalance(credentials.getAddress(), DefaultBlockParameterName.LATEST).send();
        BigInteger balanceInWei = balanceResult.getBalance();
        System.out.println("Balance: " + balanceInWei);
    }


    /** list all existent acounts **/
    private void listAccounts() throws Exception {
        final EthAccounts ethAccounts = Web3jUtils.getAccounts(web3);
        for (String account : ethAccounts.getAccounts()) {
            System.out.println("Account found: " + account);
        }
    }


    /** create a new wallet/account **/
    private void createAccount() throws Exception {
        final String file = WalletUtils.generateNewWalletFile(Constants.PASSWORD, new File(Constants.WALLET_DIR));
        Credentials credentials = WalletUtils.loadCredentials(Constants.PASSWORD, Constants.WALLET_DIR + file);
        String accountAddress = credentials.getAddress();
        String privateKey = credentials.getEcKeyPair().getPrivateKey().toString(16);
        System.out.println("File Name: " + file);
        System.out.println("Account Address: " + accountAddress);
        System.out.println("Private Key: " + privateKey);
        System.out.println("Account has been created.");
    }


    /** unlock an account **/
    private void unlockAccount() throws Exception {
        final String fileName = "UTC--2019-04-10T03-11-49.894000000Z--da335e721279e12eec1c1cda1f86e47d7dd95825.json";
        Admin admin = Admin.build(new HttpService(Constants.ETH_URL));
        Credentials credentials = WalletUtils.loadCredentials(Constants.PASSWORD, Constants.WALLET_DIR + fileName);
        PersonalUnlockAccount personalUnlockAccount = admin.personalUnlockAccount(credentials.getAddress(), Constants.PASSWORD).send();
        if (personalUnlockAccount.getError() != null) {
            throw new ClientException(personalUnlockAccount.getError().getMessage());
        }
        System.out.println("Unlocked account: " + this.credentials.getAddress() + " : " + personalUnlockAccount.accountUnlocked());
    }


    /** get gas price last block **/
    private BigInteger getGasPrice() throws IOException {
        EthGasPrice result = this.web3.ethGasPrice().send();
        System.out.println("Current Gas Price:" + result.getGasPrice());
        return result.getGasPrice();
    }


    /** get gas limit last block **/
    private BigInteger getGasLimit() throws IOException {
        Block block = web3.ethGetBlockByNumber(DefaultBlockParameterName.LATEST, true).send().getBlock();
        return block.getGasLimit();
    }


    /** send funds to a given account **/
    private void sendEth(String account) throws Exception {
        TransactionReceipt transactionReceipt = Transfer.sendFunds(web3, credentials, account, BigDecimal.ONE, Unit.ETHER).send();
        System.out.println(transactionReceipt.getBlockHash());
    }


    /** invoke a method on the deployed contract. set an amout of mileages for a given driver **/
    private void defineMileage(String account) throws Exception {
        PayByMileage contract = PayByMileage.load(Constants.CONTRACT_ADDRESS, web3, credentials, new DefaultGasProvider());
        TransactionReceipt tx = contract.defineMileage(account, BigInteger.valueOf(100000)).send();
        JsonObject document = new JsonObject();
        document.put("tx_hash", tx.getTransactionHash());
        document.put("block", tx.getBlockNumber().toString());
        document.put("from", tx.getFrom());
        document.put("to", tx.getTo());
        document.put("gas_used", tx.getGasUsed().toString());
        System.out.println(document.encodePrettily());
    }


    /** invoke a method on the deployed contract. it subtract a value from the current driver's amount **/
    private void subtractMileage(String account) throws Exception {
        PayByMileage contract = PayByMileage.load(Constants.CONTRACT_ADDRESS, web3, credentials, new DefaultGasProvider());
        TransactionReceipt tx = contract.subtractMileage(account, BigInteger.valueOf(1)).send();
        JsonObject document = new JsonObject();
        document.put("tx_hash", tx.getTransactionHash());
        document.put("block", tx.getBlockNumber().toString());
        document.put("from", tx.getFrom());
        document.put("to", tx.getTo());
        document.put("gas_used", tx.getGasUsed().toString());
        System.out.println(document.encodePrettily());
    }


    /** invoke a method on the deployed contract. it get the total amount of mileage after subtract it **/
    private void getDriverBalance(String account) throws Exception {
        PayByMileage contract = PayByMileage.load(Constants.CONTRACT_ADDRESS, web3, credentials, new DefaultGasProvider());
        BigInteger tx = contract.getBalance(account).send();
    }
}
```
