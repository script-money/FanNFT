# cdc test

## how to run

1. run emlator `cd cadence/test && flow emulator -v`
2. `yarn test`

## test case

creater 3 role, Admin/Giver/Fans。

0. Fund account FLOW balance
1. Admin can deploy contracts
2. Giver can create new package, storage to admin and can read
3. Admin can modify package's actualTotalNumber
4. Admin can mint NFT according actualTotalNumber
5. Fans can init FanNFT vault
6. Fans can claim NFT
