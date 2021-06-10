import logging
import sys
from logging import Formatter
from logging.handlers import BufferingHandler

logger = logging.getLogger(__name__)
LOGFORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# Initialize bufferhandler - will be used for /log endpoints
bufferHandler = BufferingHandler(1000)
bufferHandler.setFormatter(Formatter(LOGFORMAT))


def setup_logging_pre() -> None:
    """
    Early setup for logging.
    Uses INFO loglevel and only the Streamhandler.
    Early messages (before proper logging setup) will therefore only be sent to additional
    logging handlers after the real initialization, because we don't know which
    ones the user desires beforehand.
    """
    logging.basicConfig(
        level=logging.INFO,
        format=LOGFORMAT,
        handlers=[logging.StreamHandler(sys.stderr), bufferHandler]
    )
