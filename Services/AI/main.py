from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import http.client
import json
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Add CORS middleware to the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://0.0.0.0:8000"],  # Allow requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Define server details
HOST = "localhost"
PORT = 1234  # Update this to match your LM Studio API port


# Request models for the API endpoints

class GenerateStoryRequest(BaseModel):
    """
    Request model for the `/generate-story` endpoint.
    This model expects an annotated diary entry to generate a story.
    """
    diary_entry: str  # The annotated diary entry text for storytelling


class ChatRequest(BaseModel):
    """
    Request model for the `/chat` endpoint.
    This model expects a user's latest message and a list of previous messages for conversation context.
    """
    latest_msg: str  # The most recent message from the user
    prev_msgs: List[str]  # A list of previous messages for context


# Prompt template for storytelling
def create_story_prompt(diary_entry: str) -> str:
    """
    Create a storytelling prompt based on the annotated diary entry.

    Args:
    - diary_entry (str): The annotated diary entry to base the story on.

    Returns:
    - str: A formatted storytelling prompt.
    """
    return (
        "You are an expert storyteller and memory preservation specialist. "
        "Your goal is to transform a diary entry into a deeply immersive, fictionalized story. "
        "Focus on emotions, atmosphere, and subtle personal reflections. "
        "Ensure the narrative flows naturally while enhancing the moment through rich details.\n\n"
        "**Annotated Diary Entry for Storytelling:**\n"
        f"{diary_entry}\n\n"
        "**Storytelling Instructions:**\n"
        "1. **Retain the core essence** of the diary entry—the names of people, the overall scenario, and key events must remain recognizable.\n"
        "2. **Enhance the story with fictional elements**—add interesting events or subtle moments that make the scene more engaging and thought-provoking.\n"
        "3. **Encourage deep reflection**—the goal is for the reader to recall this memory vividly, as if it was their own.\n"
        "4. **Expand beyond the initial event**—what are the ripple effects of this moment? How does it shape the emotions and relationships involved?\n"
        "5. **Use rich sensory details**—bring the reader into the scene with descriptions of scents, sounds, touch, and subtle visual cues.\n"
        "6. **Conclude with a sense of impact**, leaving the reader with a lingering emotion or a sense of nostalgia.\n"
        "\n**Avoid generic storytelling. Instead, craft a narrative that feels deeply personal and unique, allowing the reader to feel as though they are reliving this memory with fresh depth and significance.**"
    )


# Prompt template for general chat
def create_chat_prompt(user_message: str, prev_msgs: List[str]) -> str:
    """
    Create a chat prompt based on the user's latest message and the previous messages for conversation context.

    Args:
    - user_message (str): The most recent message from the user.
    - prev_msgs (List[str]): List of previous messages for context.

    Returns:
    - str: A formatted chat prompt.
    """
    # Combine previous messages into a conversation history
    conversation_history = "\n".join(prev_msgs)
    prompt = (
        f"You are a friendly and intelligent AI assistant. "
        f"Engage in helpful and insightful conversations. "
        f"Be natural, concise, and provide informative responses.\n\n"
        f"**Conversation History:**\n{conversation_history}\n\n"
        f"**User Query:**\n{user_message}\n\n"
        "**Instructions:**\n"
        "1. Respond in a natural conversational tone.\n"
        "2. Provide relevant details concisely without unnecessary verbosity.\n"
        "3. If the user asks a follow-up question, continue the conversation naturally.\n"
        "4. Keep responses engaging and helpful.\n"
        "5. If the question is open-ended, provide a balanced perspective."
    )
    return prompt


def get_lm_response(prompt: str):
    """
    Get the language model's response based on the provided prompt.

    Args:
    - prompt (str): The prompt to send to the language model.

    Returns:
    - str: The full response from the language model as a plain string.
    """
    payload = json.dumps({
        "model": "amethyst-13b-mistral",
        "messages": [{"role": "system", "content": prompt}],
        "temperature": 1.0,
        "top_p": 0.9,
        "max_tokens": 2048,
        "stream": False  # Disable streaming
    })
    headers = {"Content-Type": "application/json"}
    conn = http.client.HTTPConnection(HOST, PORT)
    conn.request("POST", "/v1/chat/completions", payload, headers)
    res = conn.getresponse()
    data = res.read().decode("utf-8")

    # Assuming the response is in JSON format and contains 'choices' with 'text'
    response_data = json.loads(data)
    story_content = response_data["choices"][0]["message"]["content"]

    return story_content


@app.post("/generate-story", response_description="Generate a fictionalized story from an annotated diary entry")
async def generate_story(request: GenerateStoryRequest):
    """
    Endpoint to generate a fictionalized story based on an annotated diary entry.

    - **diary_entry**: The annotated diary entry to base the story on.

    Returns the extracted story content as a plain string.
    """
    diary_entry = request.diary_entry
    prompt = create_story_prompt(diary_entry)
    story_content = get_lm_response(prompt)
    return JSONResponse(content={"story": story_content})


@app.post("/chat", response_description="Generate a conversation response based on the latest message and context")
async def chat(request: ChatRequest):
    """
    Endpoint to generate a conversation response based on the user's latest message
    and the context of previous messages.

    - **latest_msg**: The most recent message from the user.
    - **prev_msgs**: A list of previous messages for context.

    Returns the chat response content as a plain string.
    """
    user_message = request.latest_msg
    prev_messages = request.prev_msgs
    prompt = create_chat_prompt(user_message, prev_messages)
    chat_content = get_lm_response(prompt)
    return JSONResponse(content={"response": chat_content})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=7000, reload=True)
