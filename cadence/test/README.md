# cdc test

## how to run

1. run emlator `cd cadence/test && flow emulator -v`
2. `yarn test`

## test case

creater 3 role, Admin/Giver/Fans。

0. Fund account FLOW balance
1. Admin can deploy contracts
2. Giver can create new package, storage to admin and can read
3. Fans can't borrow collection if not setup account
4. Fans can init FanNFT vault
5. Admin can add Address array have right to claim
6. Admin can mint NFT according claimable addresses and send to fans
<!-- 7. Fans can get all gift data his/her recieved -->
