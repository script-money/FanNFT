# FanNFT Server

The server side mainly implements 3 functions, and the contract-related functions signed by admin

1. according to the keywords inside the packageData to tweet to get the address list
2. write the address list to the contract
3. mint the new nft send to rewardable address

The whole operation logic is:
Timed to iterate through the packadate inside the locked for false resources, if the resource exceeds the deadline, according to the resource keywords to Twitter to grab the tweet with keywords and addresses within the timestamp, get the address list, random to disrupt the order. Then the randomized address and packageID, signed by the admin account, is sent to the contract to mintNFT and issued to the address list.

## Installation

python3.9  `pip install -r requirements.txt`

## How to use(emulator)

1. Refer to the instructions in web/, run the emulator, deploy the contract, start the dev-wallet, run the web, and then create the package on the web with the user account
2. `cp .env.example .env`, then fill in the `.env` with the twitter developer related parameters
3. Use `python main.py` to launch, will mint the package that meets the conditions every 5 min.

## How to use(testnet)

if run directly

1. modify .env to `DEV_ENV=testnet`
2. `python main.py`

if use docker
1. modify .env to `DEV_ENV=testnet`
2. `sh build.sh` to build image
3. use `docker run -it -d --env-file=.env --name fannft scriptmoney/fannft:0.0.2` run container