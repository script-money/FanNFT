# cdc测试

## 启动

1. 启动模拟器 `cd cadence/test && flow emulator -v`
2. `yarn test`

## 用例

创建三个角色，分别是Admin Giver和 Fans。

0. Admin要部署合约，并返回地址
1. Admin需要初始化合约的Vault
2. Giver需要能初始化的Vault
3. Giver要能创建Package资源
4. Admin要能修改Package的实际数量属性
5. Admin要能mint NFT
6. Fans要能初始化Vault
7. Fans要能claim随机的NFT
