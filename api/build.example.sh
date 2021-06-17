cp -r ../cadence .
docker build \
-t scriptmoney/fannft:0.0.1 \
--build-arg TESTNET_ADDRESS= \
--build-arg TESTNET_PRIVATE_KEY= \
--build-arg CONSUMER_KEY= \
--build-arg CONSUMER_SECRET= \
--build-arg ACCESS_TOKEN_KEY= \
--build-arg ACCESS_TOKEN_SECRET= \
--no-cache . 
rm -rf cadence