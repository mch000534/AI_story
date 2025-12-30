"""
AI Story Backend - AI Client
"""
import json
from abc import ABC, abstractmethod
from typing import Optional, AsyncGenerator, Dict, Any
import httpx

from app.models import AISettings
from app.core.security import decrypt_api_key


class BaseAIClient(ABC):
    """Abstract base class for AI clients."""
    
    @abstractmethod
    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate content from a prompt."""
        pass
    
    @abstractmethod
    async def stream_generate(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        """Generate content with streaming."""
        pass


class OpenAIClient(BaseAIClient):
    """OpenAI-compatible API client."""
    
    def __init__(self, settings: AISettings):
        self.api_key = decrypt_api_key(settings.api_key_encrypted)
        self.base_url = settings.base_url.rstrip("/")
        self.model = settings.model
        self.temperature = settings.temperature
        self.top_p = settings.top_p
        self.max_tokens = settings.max_tokens
    
    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate content synchronously."""
        messages = [{"role": "user", "content": prompt}]
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": kwargs.get("model", self.model),
                    "messages": messages,
                    "temperature": kwargs.get("temperature", self.temperature),
                    "top_p": self.top_p,
                    "max_tokens": kwargs.get("max_tokens", self.max_tokens),
                },
                timeout=120.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def stream_generate(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        """Generate content with streaming."""
        messages = [{"role": "user", "content": prompt}]
        
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": kwargs.get("model", self.model),
                    "messages": messages,
                    "temperature": kwargs.get("temperature", self.temperature),
                    "top_p": self.top_p,
                    "max_tokens": kwargs.get("max_tokens", self.max_tokens),
                    "stream": True,
                },
                timeout=120.0
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data["choices"][0].get("delta", {})
                            if "content" in delta:
                                yield delta["content"]
                        except json.JSONDecodeError:
                            continue
    
    async def test_connection(self) -> bool:
        """Test the API connection."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/models",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                return response.status_code == 200
        except Exception:
            return False


def create_ai_client(settings: AISettings) -> BaseAIClient:
    """Factory function to create an AI client."""
    # Currently only OpenAI-compatible clients are supported
    return OpenAIClient(settings)
