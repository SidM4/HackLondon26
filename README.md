# HackLondon26

## Gemini + function calling (boilerplate)

LLM boilerplate that uses **Google Gemini** with **forced function calling**: the model is configured to call a function on every response.

### Setup

```bash
pip install -r requirements.txt
export GEMINI_API_KEY="your-api-key"   # or GOOGLE_API_KEY
```

Get an API key: [Google AI Studio](https://aistudio.google.com/apikey).

### Run

```bash
python gemini_function_call.py "What is the capital of France?"
```

Or in code:

```python
from gemini_function_call import run_chat

reply = run_chat("Explain recursion in one sentence.")
```

### Behaviour

- **Function**: `on_model_response(summary, confidence, done)` — the model must call this every turn.
- **Config**: `tool_config` with `function_calling_config.mode="ANY"` so the model always invokes a tool.
- **Flow**: User message → model responds with a function call → your code runs `on_model_response` → result is sent back → model returns final text.

Edit `on_model_response` in `gemini_function_call.py` to log, persist, or forward responses as needed.
