cp -r ../cadence .
docker build -t scriptmoney/fannft:0.0.2 \
--no-cache . 
rm -rf cadence