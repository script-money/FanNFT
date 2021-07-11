#!/bin/zsh
AKASH_NODE="http://135.181.181.120:28957"
AKASH_CHAIN_ID="akashnet-2"
ACCOUNT_ADDRESS="replace with your akash address"
KEY_NAME="test"
KEYRING_BACKEND="os"
DEPLOY_YML=deploy.yaml
FEES=500uakt

TX="write tx want to query"
PROVIDER=akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
DSEQ=1747444
GSEQ=1
OSEQ=1

# 生成账户
# akash --keyring-backend "$KEYRING_BACKEND" keys add "$KEY_NAME"

# 查询账户余额
# akash query bank balances --node $AKASH_NODE $ACCOUNT_ADDRESS

# 创建认证
# akash tx cert create client --chain-id $AKASH_CHAIN_ID --keyring-backend $KEYRING_BACKEND --from $KEY_NAME --node=$AKASH_NODE --fees $FEES

# 查询认证状态
# akash query cert list --owner $ACCOUNT_ADDRESS --node=$AKASH_NODE

# 发起部署创建的交易
# akash tx deployment create $DEPLOY_YML --from $KEY_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --fees $FEES -y

# 查询竞价
# akash query market bid list --owner $ACCOUNT_ADDRESS --node $AKASH_NODE --state open

# 验证部署是否开启
# akash query deployment get --owner $ACCOUNT_ADDRESS --node $AKASH_NODE --dseq $DSEQ

# 创建租约
# akash tx market lease create --broadcast-mode async --provider $PROVIDER --dseq $DSEQ --gseq $GSEQ --oseq $OSEQ --node $AKASH_NODE --owner $ACCOUNT_ADDRESS --from $KEY_NAME --chain-id $AKASH_CHAIN_ID --fees $FEES -y

# 发送清单文件
# akash provider send-manifest $DEPLOY_YML --from $KEY_NAME --home ~/.akash --node $AKASH_NODE --dseq $DSEQ --provider $PROVIDER

# 查看交易状态
# akash query tx $TX --node "$AKASH_NODE" --chain-id $AKASH_CHAIN_ID 

# 关闭部署
# akash tx deployment close --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --gas 500000 \
# --broadcast-mode sync --dseq $DSEQ --owner $ACCOUNT_ADDRESS --from $KEY_NAME \
# --fees $FEES -y

# 查询服务的信息，可获得服务web地址
# akash provider lease-status --node $AKASH_NODE --from $KEY_NAME --dseq $DSEQ --home ~/.akash --provider $PROVIDER

# 查询容器运行的日志，查看程序状态，类似 docker logs
# akash provider lease-logs --node $AKASH_NODE --from $KEY_NAME --dseq $DSEQ --home ~/.akash --provider $PROVIDER

# 查询容器创建的日志，用于定位问题
# akash provider lease-events --node $AKASH_NODE --from $KEY_NAME --dseq $DSEQ --home ~/.akash --provider $PROVIDER
