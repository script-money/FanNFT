# FanNFT服务端

服务端主要实现3个功能，和合约相关的功能由admin签名

1. 根据packageData里面的关键词去推特获取地址列表
2. 地址列表写入到合约中
3. mint新的nft发放给地址

整个运行逻辑是：
定时去遍历packadate里面locked为false的资源，如果资源超出截止时间，就根据资源的关键词去推特抓时间范围内的带关键词和地址的tweet，获取地址列表，进行random打乱顺序。然后把乱序后的地址和packageID，通过admin账户签名，发送到合约里去mintNFT并发放到地址列表里。

## 安装

python3.9 的环境, `pip install -r requirements.txt`

## 使用方法（emulator）

1. 参考web/中的提示，运行模拟器，部署合约，启动dev-wallet，运行web，然后在web端用用户账户去create package
2. `cp .env.example .env`，然后在`.env`中填入twitter开发者相关的参数
3. 使用`python main.py`运行，每60秒会对满足条件的package进行mint

## 使用方法（testnet）

如果直接运行

1. 修改 .env 为 `DEV_ENV=testnet`
2. `python main.py`

如果使用Docker

1. 修改 .env 为 `DEV_ENV=testnet`
2. 参考 .build.example.sh 的指令构建镜像
3. 使用 `docker run -it -d --name fannft scriptmoney/fannft:0.0.1` 运行程序
