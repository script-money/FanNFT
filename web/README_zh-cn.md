# FanNFT-web

## 模拟器环境开发

1. 切换到web文件夹，用`flow emulator -v` 启动模拟器
2. 手动修改 `./cadence/contracts/FanNFT.cdc` 的 *import NonFungibleToken from* 的地址为**0xf8d6e0586b0a20c7** 
3. 输入`flow project deploy`部署两个合约
4. 注意修改`src/config.tsx`都使用模拟器的配置
5. `yarn` 安装依赖
6. 参考 [`fcl-dev-wallet`](https://github.com/onflow/fcl-dev-wallet) 说明启动本地钱包
7. `yarn start` 启动网页
