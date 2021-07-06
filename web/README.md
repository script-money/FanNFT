# FanNFT-web

## simulator environment

1. switch to web folder，use `flow emulator -v` run simulator
2. modify `./cadence/contracts/FanNFT.cdc`'s *import NonFungibleToken from* address to **0xf8d6e0586b0a20c7** manually
3. `flow project deploy` to deploy contract
4. watch out `src/config.tsx` to use simulator config
5. `yarn` to install dependency
6. refer [`fcl-dev-wallet`](https://github.com/onflow/fcl-dev-wallet) to launch local wallet
7. `yarn start` start webapp
