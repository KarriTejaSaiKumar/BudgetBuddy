"""
AI Provider Abstraction Layer for BudgetBuddy AI Assistant.

Provides a clean interface for external AI model providers (e.g. OpenAI / generic AI endpoints)
with strict timeouts, error isolation, credential protection, and automatic fallback.
"""
import os
import json
import urllib.request
import urllib.error
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

from .prompts import SYSTEM_PROMPT, build_user_prompt
from .logger import log_provider_info, log_provider_warning, log_provider_error


class BaseAIProvider(ABC):
    """
    Abstract interface for AI Providers.
    """

    @abstractmethod
    def generate_response(
        self,
        context: Dict[str, Any],
        user_message: str,
        system_prompt: str = SYSTEM_PROMPT
    ) -> Optional[str]:
        """
        Generate response from AI provider based on verified financial context.
        Returns response string if successful, or None on failure/fallback.
        """
        pass


class ExternalAIProvider(BaseAIProvider):
    """
    HTTP client for external AI providers using standard Chat Completions REST API.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: int = 10,
        max_tokens: int = 500,
        temperature: float = 0.2,
    ):
        self.api_key = api_key or os.getenv('AI_API_KEY', '').strip()
        self.base_url = (base_url or os.getenv('AI_BASE_URL', 'https://api.openai.com/v1')).rstrip('/')
        self.model = model or os.getenv('AI_MODEL', 'gpt-4o-mini')
        self.timeout = int(os.getenv('AI_TIMEOUT_SECONDS', str(timeout)))
        self.max_tokens = int(os.getenv('AI_MAX_TOKENS', str(max_tokens)))
        self.temperature = float(os.getenv('AI_TEMPERATURE', str(temperature)))

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def generate_response(
        self,
        context: Dict[str, Any],
        user_message: str,
        system_prompt: str = SYSTEM_PROMPT
    ) -> Optional[str]:
        if not self.is_configured():
            log_provider_info("AI_API_KEY is not configured; using deterministic fallback engine.")
            return None

        endpoint = f"{self.base_url}/chat/completions"
        user_prompt = build_user_prompt(user_message, context)

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "BudgetBuddy-AI-Assistant/3.0",
        }

        req = urllib.request.Request(
            url=endpoint,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                status_code = resp.getcode()
                raw_body = resp.read().decode('utf-8')

                if status_code != 200:
                    log_provider_warning(f"External AI Provider returned non-200 status: {status_code}")
                    return None

                response_data = json.loads(raw_body)
                choices = response_data.get('choices', [])
                if not choices:
                    log_provider_warning("External AI Provider response missing choices array.")
                    return None

                reply_content = choices[0].get('message', {}).get('content', '').strip()
                if not reply_content:
                    log_provider_warning("External AI Provider returned empty message content.")
                    return None

                log_provider_info(f"AI response generated successfully using model '{self.model}'.")
                return reply_content

        except urllib.error.HTTPError as http_err:
            log_provider_error(f"HTTP error during AI provider request (status {http_err.code})", http_err)
            return None
        except urllib.error.URLError as url_err:
            log_provider_error(f"Network / URL error during AI provider request", url_err)
            return None
        except TimeoutError as timeout_err:
            log_provider_error(f"Timeout ({self.timeout}s) exceeded during AI provider request", timeout_err)
            return None
        except json.JSONDecodeError as json_err:
            log_provider_error(f"Failed to parse JSON response from AI provider", json_err)
            return None
        except Exception as exc:
            log_provider_error(f"Unexpected error in ExternalAIProvider", exc)
            return None


class DeterministicFallbackProvider(BaseAIProvider):
    """
    Fallback provider that yields to the orchestrator's deterministic generation engine.
    """

    def generate_response(
        self,
        context: Dict[str, Any],
        user_message: str,
        system_prompt: str = SYSTEM_PROMPT
    ) -> Optional[str]:
        # Signals to orchestrator to use deterministic response
        return None


class AIProviderFactory:
    """
    Factory for instantiating the appropriate AI provider based on environment configuration.
    """

    @classmethod
    def get_provider(cls) -> BaseAIProvider:
        api_key = os.getenv('AI_API_KEY', '').strip()
        if api_key:
            return ExternalAIProvider(api_key=api_key)
        return DeterministicFallbackProvider()
