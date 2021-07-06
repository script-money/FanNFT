cp -r ../cadence .
docker build -t scriptmoney/fannft:0.2.1 \
--no-cache . 
rm -rf cadence