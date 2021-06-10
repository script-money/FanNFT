from flow_py_sdk.signer import InMemorySigner, HashAlgo, SignAlgo
from flow_py_sdk.cadence import Address
from pathlib import Path
import logging
import json
import os
from dotenv import load_dotenv
from loggers import setup_logging_pre


log = logging.getLogger(__name__)

load_dotenv()
setup_logging_pre()


class Config(object):
    def __init__(self) -> None:
        super().__init__()
        self.dev_env = os.getenv('DEV_ENV')
        if self.dev_env == 'emulator':
            self.access_node_host: str = "localhost"
            self.access_node_port: int = 3569
        elif self.dev_env == 'testnet':
            self.access_node_host: str = 'access.mainnet.nodes.onflow.org'
            self.access_node_port: int = 9000

        self.service_account_key_id: int = 0
        config_location = Path(__file__).parent.joinpath("flow.json")
        try:
            with open(config_location) as json_file:
                data = json.load(json_file)
                if self.dev_env == 'emulator':
                    service_account_address_base = data["accounts"]["emulator-account"]["address"]
                    self.service_account_address_str = '0x'+service_account_address_base
                    self.service_account_address = Address.from_hex(
                        service_account_address_base
                    )
                    self.service_account_signer = InMemorySigner(
                        HashAlgo.from_string(
                            data["accounts"]["emulator-account"]["hashAlgorithm"]
                        ),
                        SignAlgo.from_string(
                            data["accounts"]["emulator-account"]["sigAlgorithm"]
                        ),
                        data["accounts"]["emulator-account"]["keys"],
                    )
                elif self.dev_env == 'testnet':
                    service_account_address_base = data["accounts"]["testnet-account"]["address"]
                    self.service_account_address_str = '0x'+service_account_address_base
                    self.service_account_address = Address.from_hex(
                        service_account_address_base
                    )
                    self.service_account_signer = InMemorySigner(
                        HashAlgo.from_string(
                            data["accounts"]["testnet-account"]["hashAlgorithm"]
                        ),
                        SignAlgo.from_string(
                            data["accounts"]["testnet-account"]["sigAlgorithm"]
                        ),
                        data["accounts"]["testnet-account"]["keys"],
                    )
        except Exception:
            log.warning(
                f"Cannot open {config_location}, using default settings",
                exc_info=True,
                stack_info=True,
            )
