FROM python:3.9-buster

# Prepare environment
RUN mkdir -p /FanNFT/api

# Setup ENV
ENV TZ Asia/Shanghai

# Install dependencies
COPY . /FanNFT/api
RUN cp -r /FanNFT/api/cadence /FanNFT
WORKDIR /FanNFT/api
RUN  pip install --user --no-cache-dir -r requirements.txt

# Run code
CMD ["python","main.py"]