---
title: ' Blockchain - Geth Ethereum'
date: 2018-04-04T19:18:41-03:00
draft: true
---

**POC** using Geth to create a private blockchain network running asynchronous events on top of it.

In order to create a blockchain peer we have to create two files **Dockerfile** and **genesis.json**.

This set up gives us a testing accont and a single node connected to a private network. @see -> chainId

`Dockerfile`

```yaml
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

RUN mkdir ~/.account_password
RUN echo "12345678" > ~/.account_password/password.txt
RUN echo "20c33834cdfa7703b90d988e66e6bb6d1b89d66a394db2357dfcb7d1941c0ef3" > ~/.privatekey
RUN ./geth account import --datadir ~/.ethereum/testnet --password ~/.account_password/password.txt ~/.privatekey

CMD exec ./geth --testnet --syncmode "fast" -cache 2048 --verbosity=4 --rpc --rpcaddr "0.0.0.0" --rpcport 8545 --rpccorsdomain="*" --mine --minerthreads=2 --rpcapi "db,eth,net,web3,personal,miner,admin,txpool,debug" --unlock "0xda335e721279e12eec1c1cda1f86e47d7dd95825" --password ~/.account_password/password.txt --etherbase "0xda335e721279e12eec1c1cda1f86e47d7dd95825"
```

`genesis.json`

```json
{
  "config": {
    "chainId": 3,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "clique": {
      "period": 5,
      "epoch": 30000
    }
  },
  "difficulty": "1",
  "gasLimit": "6721975",
  "extradata": "0x00000000000000000000000000000000000000000000000000000000000000007df9a875a174b3bc565e6424a0050ebc1b2d1d820000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "alloc": {
    "0xda335e721279e12eec1c1cda1f86e47d7dd95825": { "balance": "100000000000000000000000000000" }
  }
}
```

This `docker-compose` starts Geth, MongoDB, Graphana, Prometheus and Metrics Web service instance.

1. Dashboard export metrics to Prometheus that gets information from Geth;
1. Geth is the implemetation of Ethereum protocol;
1. Grafana is a dashboard for data analysis;
1. Prometheus stores time series data;
1. MongoDB stores application events;

`docker-compose.yml`

```yaml
version: '3.5'
services:
  dashboard:
    container_name: 'dashboard'
    image: metiago/dashboard
    build: './dashboard'
    restart: 'on-failure'
    ports:
      - '4000:4000'
    environment:
      GETH: ${GETH}
      ADDRESSES: ${ADDRESSES}
      DELAY: ${DELAY}
    links:
      - ethereum:geth
    depends_on:
      - ethereum

  ethereum:
    container_name: 'ethereum'
    build: './ethereum'
    image: 'metiago/ethereum'
    volumes: 
      - $PWD/volumes/ethereum:/block-data
    ports:  
      - '30301:30301'
      - '8545:8545'
      - '30303:30303'
      - '58342:58342'

  grafana:
    container_name: 'grafana'
    image: 'grafana/grafana'
    restart: 'on-failure'
    volumes: 
      - $PWD/volumes/grafana:/var/lib/grafana
    ports:
      - '3000:3000'
    links:
      - prometheus:prometheus

  prometheus:
    container_name: 'prometheus'
    image: 'prom/prometheus'
    restart: 'on-failure'
    volumes: 
      - $PWD/volumes/prometheus:/etc/prometheus
    ports:
      - '9090:9090'
    links:
      - dashboard:dashboard

  mongo:
    image: "mongo:4.0.2"
    ports:
      - "27017:27017"
    command: --profile=1 --slowms=0

  mongo-express:
    image: "mongo-express:0.49.0"
    ports:
      - "8081:8081"
    depends_on:
      - mongo
```

### Blockchain Contract

Basically, contracts works as an agreement between peers in the application. 

`DIContract.sol` 

```bash
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.20;


contract DIContract {

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

The backend uses Eclipse Vert.x and Websockets.

In the **wallet** module, there are 3 files:

1. `log4j2.xml` which configures the application logging;
2. `WalletServer.java` contains a single endpoint to authenticate users using JWT;
3. `WalletRobot.java` This simulates cars sensors sending events to the API that executes transactions in the Geth node. Once the transaction is done, the 
event result is saved in MongoDB and then a notification is sent via Websocket;

In the **insurance** module, there are 4 files:
1. `log4j2.xml` which configures the application logging;
2. `Validator.java` payload data validator;
3. `InsuranceRobot.java` Runs background threads that reads the events from MongoDB and
   send it via websocket to update the transaction screen.
4. `InsuranceServer.java` Endpoints to manage users data in Geth.

In the **frontend** folder, there is a React JS application (GUI). 

### Generate Java Stubs

`compile.sh` compiles the blockchain contract and move the stub classes to application Java packages.

```bash
#!/bin/bash

# COMPILE CONTRACT
solcjs DIContract.sol --bin --abi --optimize -o .

sleep 1

# CLEAN UP
rm -rf DIContract.abi DIContract.bin

sleep 1

# RENAME FILES
mv DIContract_sol_DIContract.abi DIContract.abi

mv DIContract_sol_DIContract.bin DIContract.bin

sleep 1

# CREATE A JAVA WRAPPER CLASS USED TO INVOKE REMOTE FUNCTIONS
web3j generate solidity -b DIContract.bin -a DIContract.abi -o /Users/tiago/workspace/daap-ethereum/domain/src/main/java -p io.tiago.pyg.domain.contract
```

### Running The App

1. Deploy our contract into Geth. This can be done using the class `GethApiTest.java` located in the tests folder of `insurance` module.
2. Run both Java main class application `InsuranceServer.java` and `WalletServer.java`
3. Run the frontend project `npm start`

### GUI - Screenshots

<img src="/site/images/daap/eth-graphana.png" width="auto" >

<img src="/site/images/daap/new-account.png" width="auto" >

<img src="/site/images/daap/login.png" width="auto" >

<img src="/site/images/daap/accounts.png" width="auto" >

<img src="/site/images/daap/accounts-mileages.png" width="auto" >

<img src="/site/images/daap/transaction-logs.png" width="auto" >

<img src="/site/images/daap/wallet.png" width="auto" >

