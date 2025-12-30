"""
AI Story Backend - AI Client
"""
import json
import logging
from abc import ABC, abstractmethod
from typing import Optional, AsyncGenerator, Dict, Any
import httpx

from app.models import AISettings
from app.core.security import decrypt_api_key

logger = logging.getLogger(__name__)


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
    """OpenAI-compatible API client (works with OpenRouter, etc.)."""
    
    def __init__(self, settings: AISettings):
        self.api_key = decrypt_api_key(settings.api_key_encrypted)
        self.base_url = settings.base_url.rstrip("/")
        self.model = settings.model
        self.temperature = settings.temperature
        self.top_p = settings.top_p
        self.max_tokens = settings.max_tokens
        self.provider = settings.provider
    
    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate content synchronously."""
        messages = [{"role": "user", "content": prompt}]
        
        request_body = {
            "model": kwargs.get("model", self.model),
            "messages": messages,
            "temperature": kwargs.get("temperature", self.temperature),
            "top_p": self.top_p,
            "max_tokens": kwargs.get("max_tokens", self.max_tokens),
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        # Add OpenRouter-specific headers
        if "openrouter" in self.base_url.lower():
            headers["HTTP-Referer"] = "http://localhost:3000"
            headers["X-Title"] = "AI Story Tool"
        
        logger.info(f"Generating content with model: {self.model}")
        logger.debug(f"Request URL: {self.base_url}/chat/completions")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=request_body,
                    timeout=180.0  # Longer timeout for long generations
                )
                
                if response.status_code != 200:
                    error_text = response.text
                    logger.error(f"API Error {response.status_code}: {error_text}")
                    raise Exception(f"API returned {response.status_code}: {error_text}")
                
                data = response.json()
                
                if "choices" not in data or len(data["choices"]) == 0:
                    logger.error(f"Unexpected response format: {data}")
                    raise Exception(f"Unexpected API response format")
                
                content = data["choices"][0]["message"]["content"]
                logger.info(f"Generated {len(content)} characters")
                return content
                
        except httpx.TimeoutException as e:
            logger.error(f"Request timeout: {e}")
            raise Exception("Request timed out. Please try again.")
        except httpx.HTTPError as e:
            logger.error(f"HTTP Error: {e}")
            raise Exception(f"HTTP Error: {str(e)}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            raise Exception("Failed to parse API response")
    
    async def stream_generate(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        """Generate content with streaming."""
        messages = [{"role": "user", "content": prompt}]
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        # Add OpenRouter-specific headers
        if "openrouter" in self.base_url.lower():
            headers["HTTP-Referer"] = "http://localhost:3000"
            headers["X-Title"] = "AI Story Tool"
        
        request_body = {
            "model": kwargs.get("model", self.model),
            "messages": messages,
            "temperature": kwargs.get("temperature", self.temperature),
            "top_p": self.top_p,
            "max_tokens": kwargs.get("max_tokens", self.max_tokens),
            "stream": True,
        }
        
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=request_body,
                timeout=180.0
            ) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    raise Exception(f"API returned {response.status_code}: {error_text.decode()}")
                
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
    
    async def test_connection(self) -> tuple[bool, str]:
        """Test the API connection."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
        }
        
        # Add OpenRouter-specific headers
        if "openrouter" in self.base_url.lower():
            headers["HTTP-Referer"] = "http://localhost:3000"
            headers["X-Title"] = "AI Story Tool"
        
        try:
            async with httpx.AsyncClient() as client:
                # Try to list models as a connection test
                response = await client.get(
                    f"{self.base_url}/models",
                    headers=headers,
                    timeout=10.0
                )
                if response.status_code == 200:
                    return True, "連接成功"
                else:
                    return False, f"API 返回 {response.status_code}"
        except httpx.TimeoutException:
            return False, "連接超時"
        except Exception as e:
            return False, str(e)


def create_ai_client(settings: AISettings) -> BaseAIClient:
    """Factory function to create an AI client."""
    return OpenAIClient(settings)
