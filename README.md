# FanNFT

A Dapp that allows KOL to easily give NFT gifts to their fans, host on [Akash decloud](https://akash.network/), smart contract using [flow blockchain](https://www.onflow.org/), NFT images save on [Skynet](https://siasky.net/)

1. KOL can set up promotional content and create NFT gift packs
2. Fans will have a chance to win an NFT drop by simply tapping "Retweet to my Twitter" and not deleting the tweet before the deadline.
3. The server will automatically crawl the tweets, randomly select the lucky winners and generate NFT gifts to send to them

[Dweb Deployment Guide](https://dweb.script.money/posts/dweb_guide_en)

## Project Structure

### Process

![overview](overview.jpg)

## Folder Description

### api

Using [flow-python-sdk](https://github.com/janezpodhostnik/flow-py-sdk/) to interact with flow blockchain. The server uses the Admin's private key to sign and send the transaction to "randomly select the lucky winner and generate an NFT gift to send to them". Requires manual setup of Twitter developer account keys. More intro: [api/README.md](./api/README.md)

### web

Web App for FanNFT

### app

Another version FanNFT Web App

### cadence

The core contract is [contract/FanNFT.cdc](./contract/FanNFT.cdc). Transactions are divided into giver, admin, and fans folders, which correspond to the transactions that should be sent for different roles and permissions.
Use [flow-js-testing](https://github.com/onflow/flow-js-testing) for testing, for instructions see [cadence/test/README.md](./cadence/test/README.md)

### guide

The documents about how to deploying FanNFT use dWeb toolkits, build by [next.js](https://nextjs.org)
