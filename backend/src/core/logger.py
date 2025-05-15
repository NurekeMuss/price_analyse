import logging

from src.core.config import get_backend_config


def get_logger(name="fastapi"):
    """
    Configures and returns a logger instance.
    """
    config = get_backend_config()
    logger = logging.getLogger(name)

    # Stream Handler for Console
    stream_handler = logging.StreamHandler()
    stream_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    stream_handler.setFormatter(stream_formatter)
    logger.addHandler(stream_handler)

    # Prevent duplicate logs
    logger.propagate = False

    if config.DEBUG:
        if not logger.handlers:
            logger.setLevel(logging.DEBUG)
    else:
        if not logger.handlers:  # Prevent adding handlers multiple times
            logger.setLevel(logging.INFO)

    return logger
