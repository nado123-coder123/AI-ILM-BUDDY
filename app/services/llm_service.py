from functools import lru_cache

from anthropic import Anthropic
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings
from app.core.prompts import SYSTEM_PROMPT


class LLMService:
    def __init__(self, api_key: str, model: str):
        self.client = Anthropic(api_key=api_key)
        self.model = model

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
    def generate_answer(self, question: str, context: str, language: str) -> str:
        system = SYSTEM_PROMPT.format(context=context, language=language)
        response = self.client.messages.create(
            model=self.model,
            max_tokens=800,
            system=system,
            messages=[{"role": "user", "content": question}],
        )
        return "".join(
            block.text for block in response.content if block.type == "text"
        )


@lru_cache
def get_llm_service() -> LLMService:
    settings = get_settings()
    return LLMService(settings.anthropic_api_key, settings.llm_model)
