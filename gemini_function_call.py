"""
Gemini LLM boilerplate with forced function calling.
The model is configured to call a function on every response (mode='ANY').
"""

import os
from google import genai
from google.genai import types


# --- Function the LLM must call every time ---

def on_model_response(summary: str, confidence: float, done: bool) -> dict:
    """
    Called by the application when the LLM invokes this tool.
    The model is instructed to call this on every turn so you can process
    or persist its response in a structured way.

    Args:
        summary: Short summary of what the model is saying or decided.
        confidence: Model's confidence in the response (0.0 to 1.0).
        done: Whether the model considers the turn/task complete.

    Returns:
        Acknowledgment for the model.
    """
    print(f"[TOOL] on_model_response called:")
    print(f"       summary={summary!r}")
    print(f"       confidence={confidence}")
    print(f"       done={done}")
    # Add your logic here: save to DB, emit event, etc.
    return {"received": True, "confidence": confidence, "done": done}


# Declaration for the model (OpenAPI-style schema)
ON_MODEL_RESPONSE_DECLARATION = {
    "name": "on_model_response",
    "description": (
        "You MUST call this function in every response. Use it to report your "
        "answer or reasoning: provide a brief summary, your confidence (0.0-1.0), "
        "and whether you are done with this turn."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "summary": {
                "type": "string",
                "description": "Brief summary of your response or decision.",
            },
            "confidence": {
                "type": "number",
                "description": "Your confidence in this response from 0.0 to 1.0.",
            },
            "done": {
                "type": "boolean",
                "description": "True if you have finished this turn; false if you expect to continue.",
            },
        },
        "required": ["summary", "confidence", "done"],
    },
}


def run_chat(user_message: str) -> str:
    """
    Send a message to Gemini, force a function call, execute it, then get
    the model's final text reply.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("Set GEMINI_API_KEY or GOOGLE_API_KEY in the environment")

    client = genai.Client(api_key=api_key)

    tools = types.Tool(function_declarations=[ON_MODEL_RESPONSE_DECLARATION])
    config = types.GenerateContentConfig(
        tools=[tools],
        tool_config=types.ToolConfig(
            function_calling_config=types.FunctionCallingConfig(mode="ANY")
        ),
    )

    contents = [types.Content(role="user", parts=[types.Part(text=user_message)])]

    # First call: model must call on_model_response
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=contents,
        config=config,
    )

    candidate = response.candidates[0]
    if not candidate.content or not candidate.content.parts:
        return response.text or "(no content)"

    parts = candidate.content.parts
    function_call = None
    text_parts = []

    for part in parts:
        if part.function_call and part.function_call.name == "on_model_response":
            function_call = part.function_call
        if part.text:
            text_parts.append(part.text)

    if not function_call:
        return (response.text or "").strip() or "(model did not call the function)"

    # Execute the function
    args = dict(function_call.args)
    result = on_model_response(
        summary=args.get("summary", ""),
        confidence=float(args.get("confidence", 0.0)),
        done=bool(args.get("done", True)),
    )

    # Send function result back so the model can produce final text
    contents.append(types.Content(role="model", parts=parts))
    contents.append(
        types.Content(
            role="user",
            parts=[
                types.Part.from_function_response(
                    name=function_call.name,
                    response=result,
                )
            ],
        )
    )

    final = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=contents,
        config=config,
    )

    return (final.text or "").strip()


if __name__ == "__main__":
    import sys

    prompt = sys.argv[1] if len(sys.argv) > 1 else "What is 2 + 2? Reply briefly."
    print("User:", prompt)
    print()
    reply = run_chat(prompt)
    print("Model:", reply)
