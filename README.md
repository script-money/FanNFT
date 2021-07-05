# FanNFT

A Dapp that allows KOL to easily give NFT gifts to their fans, host on [Akash decloud](https://akash.network/), smart contract using [flow blockchain](https://www.onflow.org/), NFT images save on [Skynet](https://siasky.net/)

1. KOL can set up promotional content and create NFT gift packs
2. Fans will have a chance to win an NFT drop by simply tapping "Retweet to my Twitter" and not deleting the tweet before the deadline.
3. The server will automatically crawl the tweets, randomly select the lucky winners and generate NFT gifts to send to them

## Project Structure

### Process

![overview](overview.jpg)

## Folder Description

### api

Using [flow-python-sdk](https://github.com/janezpodhostnik/flow-py-sdk/) to interact with flow blockchain. The server uses the Admin's private key to sign and send the transaction to "randomly select the lucky winner and generate an NFT gift to send to them". Requires manual setup of Twitter developer account keys. More intro: [api/README.md](./api/README.md)

### web

Reference [fcl-demo](https://github.com/portto/fcl-demo), currently only simple pages are made to test all interfaces for web side and contract interaction. Instructions for use can be found in[web/README.md](./web/README.md)

### cadence

The core contract is [contract/FanNFT.cdc](./contract/FanNFT.cdc). Transactions are divided into giver, admin, and fans folders, which correspond to the transactions that should be sent for different roles and permissions.
Use [flow-js-testing](https://github.com/onflow/flow-js-testing) for testing, for instructions see [cadence/test/README.md](./cadence/test/README.md)

