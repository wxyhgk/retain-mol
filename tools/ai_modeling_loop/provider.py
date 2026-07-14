from __future__ import annotations

import base64
import json
import mimetypes
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class OpenAICompatibleConfig:
    base_url: str
    api_key: str
    model: str
    timeout_seconds: float = 240.0

    @classmethod
    def from_environment(cls) -> "OpenAICompatibleConfig":
        base_url = os.environ.get("OPENAI_BASE_URL", "").rstrip("/")
        api_key = os.environ.get("OPENAI_API_KEY", "")
        model = os.environ.get("OPENAI_MODEL", "")
        missing = [
            name
            for name, value in (
                ("OPENAI_BASE_URL", base_url),
                ("OPENAI_API_KEY", api_key),
                ("OPENAI_MODEL", model),
            )
            if not value
        ]
        if missing:
            raise ValueError("Missing provider environment: " + ", ".join(missing))
        return cls(base_url=base_url, api_key=api_key, model=model)


class OpenAICompatibleClient:
    def __init__(self, config: OpenAICompatibleConfig):
        self.config = config

    def complete_json(
        self,
        *,
        prompt: str,
        image: Path,
        max_tokens: int = 4096,
        temperature: float = 0.0,
    ) -> dict[str, Any]:
        mime_type = mimetypes.guess_type(image.name)[0] or "image/png"
        image_url = (
            f"data:{mime_type};base64," + base64.b64encode(image.read_bytes()).decode("ascii")
        )
        payload = {
            "model": self.config.model,
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"},
        }
        request = urllib.request.Request(
            f"{self.config.base_url}/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.config.api_key}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(
                request,
                timeout=self.config.timeout_seconds,
            ) as response:
                result = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Provider returned HTTP {error.code}: {detail}") from error
        except urllib.error.URLError as error:
            raise RuntimeError(f"Provider request failed: {error.reason}") from error

        choices = result.get("choices") or []
        if not choices:
            raise RuntimeError("Provider response has no choices")
        content = choices[0].get("message", {}).get("content")
        if not isinstance(content, str) or not content.strip():
            raise RuntimeError("Provider response has no textual JSON content")
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as error:
            raise RuntimeError(f"Provider returned invalid JSON: {error}") from error
        if not isinstance(parsed, dict):
            raise RuntimeError("Provider JSON response must be an object")
        return {"payload": parsed, "providerResponse": result}
