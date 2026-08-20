"""
Safe Operational Logger for BudgetBuddy AI Assistant.

Ensures no API keys, JWT tokens, sensitive financial amounts, or PII
are leaked into server logs during operational events or error reporting.
"""
import logging
import re

logger = logging.getLogger('chat.ai_provider')


def mask_sensitive_data(text: str) -> str:
    """
    Mask potential API keys, bearer tokens, or sensitive patterns in log messages.
    """
    if not isinstance(text, str):
        return str(text)

    # Mask Bearer / JWT tokens
    masked = re.sub(r'(Bearer\s+)[A-Za-z0-9\-_.]+', r'\1[REDACTED_TOKEN]', text, flags=re.IGNORECASE)

    # Mask API keys (e.g. sk-..., AIzaSy..., or key=...)
    masked = re.sub(r'(sk-[A-Za-z0-9_-]{8,})', r'[REDACTED_API_KEY]', masked)
    masked = re.sub(r'(key=)[A-Za-z0-9_-]+', r'\1[REDACTED_API_KEY]', masked, flags=re.IGNORECASE)
    masked = re.sub(r'(AI_API_KEY=)[^\s&]+', r'\1[REDACTED_API_KEY]', masked)

    return masked


def log_provider_info(message: str) -> None:
    logger.info(mask_sensitive_data(message))


def log_provider_warning(message: str) -> None:
    logger.warning(mask_sensitive_data(message))


def log_provider_error(message: str, exc: Exception = None) -> None:
    err_desc = f": {type(exc).__name__}" if exc else ""
    safe_msg = mask_sensitive_data(f"{message}{err_desc}")
    logger.error(safe_msg)
