"""
Simple Gemini input → output interface.
Send a prompt, get a response. No chat history.
"""

import os
from google import genai


def _get_api_key() -> str:
    """Get API key from secrets.py or environment."""
    try:
        from secrets import GEMINI_API_KEY
        if GEMINI_API_KEY:
            return GEMINI_API_KEY
    except ImportError:
        pass
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "Set your API key in secrets.py (GEMINI_API_KEY) or set "
            "GEMINI_API_KEY / GOOGLE_API_KEY in the environment"
        )
    return api_key


def query(prompt: str) -> str:
    """Send a prompt to Gemini and return the response text."""
    api_key = _get_api_key()

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-3.1-pro-preview",
        contents=prompt,
    )
    return response.text.strip()


if __name__ == "__main__":
    import sys

    prompt = sys.argv[1] if len(sys.argv) > 1 else "What is 2 + 2? Reply briefly."
    print("User:", prompt)
    print("Model:", query(prompt))
