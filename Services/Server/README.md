
# Server Service

## Overview

The **Server Service** is part of the Livie project, responsible for analyzing user interactions and providing either a story or a chat response based on the context of the conversation. The service uses the `amethyst-13b-mistral` LLM model to generate human-like responses. It listens for incoming requests and processes them to determine whether the conversation is focused on a specific topic or a casual chat.

### Key Features:
1. **Emotion and Motive Analysis**: The service analyzes the last three user messages to determine if the conversation is focused on a specific topic (e.g., planning a trip, discussing a disease) or if it’s a casual chat.
2. **Story or Chat Response**: Based on the analysis, the service will either generate a story or a chat response.
3. **LLM Model Interaction**: The service interacts with the `amethyst-13b-mistral` LLM model at `http://localhost:1234/v1/chat/completions` to generate appropriate responses.

## Routes

### 1. `/analyze-interaction`

**Method**: `POST`

**Description**: This route analyzes the user's messages and determines whether the conversation is focused (like planning a trip or discussing a disease) or a casual chat. Based on this analysis, it either generates a **story** or **chat** response using the LLM model.

**Request Body** (JSON):
```json
{
  "latest_msg": "string",  // The most recent message from the user
  "prev_msgs": [          // A list of previous messages for context
    "string"
  ]
}
```

**Response** (JSON):
The response will contain the generated story or chat based on the analysis.

**Example**:
- Request:
```json
{
  "latest_msg": "Tell me more about the disease I’m researching",
  "prev_msgs": [
    "What is this disease?",
    "I need more information about this condition."
  ]
}
```
- Response (Story):
```json
{
  "response": "The disease you're researching is quite complex. It affects..."
}
```

---

### 2. `/chat`

**Method**: `POST`

**Description**: This route handles user interactions and generates a response (either a story or chat) based on the user's latest message and context.

**Request Body** (Form Data):
```form
latest_msg=string    // The most recent message from the user
prev_msgs=array<string> // List of previous messages for context
```

**Example**:
- Request:
```form
latest_msg=hi
prev_msgs=["hello", "how are you?"]
```

- Response (Chat):
```json
{
  "response": "Hello! How can I assist you today?"
}
```

---

## LLM Model Interaction

The server interacts with the `amethyst-13b-mistral` model hosted at `http://localhost:1234/v1/chat/completions`. The LLM generates human-like responses based on the provided context and prompt.

### Example cURL Request to LLM:

```bash
curl -X 'POST'   'http://localhost:1234/v1/chat/completions'   -H 'Content-Type: application/json'   -d '{
    "model": "amethyst-13b-mistral",
    "messages": [
      { "role": "system", "content": "Always answer in rhymes. Today is Thursday" },
      { "role": "user", "content": "What day is it today?" }
    ],
    "temperature": 0.7,
    "max_tokens": -1,
    "stream": false
  }'
```

## Configuration

- **Timeout**: A timeout of 60 seconds is applied for HTTP requests to the LLM model.
- **Port**: The service is designed to run on port `8000` for the server and interacts with the LLM model on `localhost:1234`.

## Requirements

- Python 3.7+
- FastAPI
- httpx (for making HTTP requests)
- Logging
- LLM Model (`amethyst-13b-mistral`)

## Setup

1. Clone the repository and navigate to the `Server` submodule.
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
