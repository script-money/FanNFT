import logging
from flow_py_sdk import (
    cadence,
    flow_client,
    SignAlgo,
    HashAlgo,
    AccountKey,
    create_account_template,
    Tx,
    ProposalKey,
    Script
)
import re
import json
import asyncio
from config import Config
import time
from dotenv import load_dotenv
import sys
import os
from TwitterAPI import TwitterAPI, TwitterResponse, TwitterConnectionError
import time
import random
from pathlib import Path
import random
from loggers import setup_logging_pre

logger = logging.getLogger(__name__)

nonFungibleTokenPath = '"../../contracts/NonFungibleToken.cdc"'
fanNFTPath = '"../../contracts/FanNFT.cdc"'
load_dotenv()
ctx = Config()
setup_logging_pre()

consumer_key = os.getenv('CONSUMER_KEY')
consumer_secret = os.getenv('CONSUMER_SECRET')
access_token_key = os.getenv('ACCESS_TOKEN_KEY')
access_token_secret = os.getenv('ACCESS_TOKEN_SECRET')
proxy_url = os.getenv('PROXY_URL')


async def add_address(addresses: list[str], package_id: int):
    """[添加过滤满足条件的地址，发送transaction添加到package的rewardaddress里]

    Args:
        addresses (list[str]): [过滤后的地址]
        package_id (int): [FanNFT合约里对应的礼包id]
    """
    async with flow_client(
        host=ctx.access_node_host, port=ctx.access_node_port
    ) as client:
        addresses_arg = cadence.Array(
            list(map(lambda i: cadence.Address.from_hex(i), addresses))
        )
        package_id_arg = cadence.UInt32(package_id)
        block = await client.get_latest_block()
        proposer = await client.get_account_at_latest_block(
            address=ctx.service_account_address.bytes
        )
        tx = Tx(
            code=open(Path(__file__).parent.joinpath(
                "../cadence/transactions/admin/add_reward_addresses.cdc"))
            .read()
            .replace(fanNFTPath, ctx.service_account_address_str),
            reference_block_id=block.id,
            payer=ctx.service_account_address,
            proposal_key=ProposalKey(
                key_address=ctx.service_account_address,
                key_id=ctx.service_account_key_id,
                key_sequence_number=proposer.keys[
                    ctx.service_account_key_id
                ].sequence_number,
            ),
        ).add_authorizers(
            ctx.service_account_address
        ).add_arguments(
            addresses_arg
        ).add_arguments(
            package_id_arg
        ).with_payload_signature(
            ctx.service_account_address,
            ctx.service_account_key_id,
            ctx.service_account_signer,
        ).with_envelope_signature(
            ctx.service_account_address,
            ctx.service_account_key_id,
            ctx.service_account_signer,
        )
        await client.execute_transaction(tx)


async def batch_mint_gift(package_id: int):
    """[让特定礼包生成礼物并发放]

    Args:
        package_id (int): [礼包id]
    """
    async with flow_client(
        host=ctx.access_node_host, port=ctx.access_node_port
    ) as client:
        package_id_arg = cadence.UInt32(package_id)
        block = await client.get_latest_block()
        proposer = await client.get_account_at_latest_block(
            address=ctx.service_account_address.bytes
        )
        tx = Tx(
            code=open(Path(__file__).parent.joinpath(
                "../cadence/transactions/admin/batch_mint_gift.cdc"))
            .read()
            .replace(fanNFTPath, ctx.service_account_address_str)
            .replace(nonFungibleTokenPath, ctx.service_account_address_str),
            reference_block_id=block.id,
            payer=ctx.service_account_address,
            proposal_key=ProposalKey(
                key_address=ctx.service_account_address,
                key_id=ctx.service_account_key_id,
                key_sequence_number=proposer.keys[
                    ctx.service_account_key_id
                ].sequence_number,
            ),
        ).with_gas_limit(
            9999
        ).add_authorizers(
            ctx.service_account_address
        ).add_arguments(
            package_id_arg
        ).with_payload_signature(
            ctx.service_account_address,
            ctx.service_account_key_id,
            ctx.service_account_signer,
        ).with_envelope_signature(
            ctx.service_account_address,
            ctx.service_account_key_id,
            ctx.service_account_signer,
        )
        await client.execute_transaction(tx)


async def get_packages_data() -> list:
    """[发送Scripts，获取所有礼包数据]

    Returns:
        list: [礼包的struct列表]
    """
    async with flow_client(
        host=ctx.access_node_host, port=ctx.access_node_port
    ) as client:
        block = await client.get_latest_block()
        script = Script(
            code=open(Path(__file__).parent.joinpath('../cadence/scripts/user/get_all_packages.cdc')).read().replace(
                fanNFTPath, ctx.service_account_address_str)
        )
        reference_block_id = block.id
        return await client.execute_script(script=script, at_block_id=reference_block_id)


def get_address_from_twitter(keyword: str, start_time: int, end_time: int) -> list[str]:
    """[通过特定条件搜索tweets并获取满足条件的地址列表]

    Args:
        keyword (str): [关键词]
        start_time (int): [开始的时间戳，单位是秒]
        end_time (int): [结束的时间戳，单位是秒]

    Returns:
        list[str]: [符合条件tweet的地址列表]
    """
    if consumer_key == '' or consumer_secret == '' or access_token_key == '' \
            or access_token_secret == '':
        logger.error('TwitterAPI env variable are not set')
        return []
    result = None
    while result is None:
        try:
            api = TwitterAPI(consumer_key, consumer_secret,
                             access_token_key, access_token_secret, proxy_url=proxy_url)
            tolerance = 0
            if os.getenv('DEV_ENV') == 'emulator':
                tolerance = 60*60*48  # 为了方便调试，前后时间范围扩大了48小时，生产环境tolerance为0
            tweets: TwitterResponse = api.request(
                'search/tweets',
                {'q': f'#FanNFT {keyword} since_time:{start_time-tolerance} until_time:{end_time+tolerance}',
                    'count': 100}
            )
            regex = r"0x[a-fA-F0-9]{16}"  # flow的0x地址
            addresses = []
            for tweet in tweets:
                result = re.search(regex, tweet['text'])
                if result is not None:
                    addresses.append(result.group())
            result = True
            return addresses
        except:
            logger.warning(
                f'TwitterAPI search {keyword} error, wait 1 min and retry')
            time.sleep(60)


def get_mint_packages(array: cadence.Array) -> list[tuple[list[str], int, str, int, int, int]]:
    """[解析cadence的array格式返回的数据，获取要mint的package信息组成元组]

    Args:
        array (cadence.Array): [get_packages_data获取的array]

    Returns:
        list[tuple[list[str], int, str, int, int, int]]: [待输入twitterAPI查询的元组信息]]
    """
    result = []
    for package in array.encode_value()['value']:
        fields = package['value']['fields']
        locked_field = list(filter(
            lambda f: f['name'] == 'locked', fields))[0]
        locked = locked_field['value']['value']
        if not locked:
            rewardAddresses_field = list(filter(
                lambda f: f['name'] == 'rewardAddresses', fields))[0]
            address_list = rewardAddresses_field['value']['value']
            packageId_field = list(filter(
                lambda f: f['name'] == 'packageID', fields))[0]
            package_id: str = int(packageId_field['value']['value'])

            metadata_field = list(filter(
                lambda f: f['name'] == 'metadata', fields))[0]
            metadata: dict = json.loads(metadata_field['value']['value'])
            key_word = metadata['keyWord']
            create_at = metadata['createAt']
            deadline = metadata['deadline']
            total_number_field = list(filter(
                lambda f: f['name'] == 'totalNumber', fields))[0]
            total_number = int(total_number_field['value']['value'])
            result.append((address_list, package_id,
                           key_word, create_at, deadline, total_number))
    return result


def select_addresses(address_from_twitter_source: list[str], exists_address: list[str], total_number: int) -> list[str]:
    """[过滤推特获取的地址，如果已经在合约里就不要再添加，另外如果超出发放的最大数量，进行链下随机选择]

    Args:
        address_from_twitter_source (list[str]): [twitter获取的源地址列表]
        exists_address (list[str]): [从package_data中读到的已经有的地址]
        total_number (int): [从package_data中读到的礼物最大发放量]

    Returns:
        list[str]: [满足条件的地址]
    """
    address_from_twitter = list(
        filter(lambda i: i not in exists_address, address_from_twitter_source))
    if total_number >= len(address_from_twitter):
        random.shuffle(address_from_twitter)
        return address_from_twitter
    else:
        random.shuffle(address_from_twitter)
        return address_from_twitter[:total_number]


def periodic(period):
    def scheduler(fcn):
        async def wrapper(*args, **kwargs):
            while True:
                asyncio.create_task(fcn(*args, **kwargs))
                await asyncio.sleep(period)
        return wrapper
    return scheduler


@periodic(60)
async def main():
    package_array: cadence.Array = await get_packages_data()  # 从合约获取package_data
    to_mint_packages = get_mint_packages(package_array)  # 解析package_data，得到列表
    if len(to_mint_packages) == 0:
        logger.info('No new package need to be mint')
        return

    for package in to_mint_packages:
        exists_address = package[0]
        total_number = package[5]
        address_from_twitter_source = get_address_from_twitter(
            package[2], package[3], package[4])  # 从推特获取地址列表
        if len(address_from_twitter_source) == 0:
            logger.info('No new tweets are found')
            return
        selected_address = select_addresses(
            address_from_twitter_source, exists_address, total_number)  # 随机选择地址
        if len(selected_address) == 0:
            return
        await add_address(selected_address, package[1])  # 地址加入到合约中
        await batch_mint_gift(package[1])  # mintNFT发放到各地址

if __name__ == "__main__":
    asyncio.run(main())
