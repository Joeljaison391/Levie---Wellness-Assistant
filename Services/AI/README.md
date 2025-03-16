
# AI Assistant Service - Submodule

This service provides a conversational AI assistant and storytelling generation system using FastAPI. The service includes two primary endpoints:

1. `/generate-story`: Accepts an annotated diary entry and generates a fictionalized story.
2. `/chat`: Facilitates natural conversation by considering previous messages for context.

The service uses the `amethyst-13b-mistral` language model to generate responses.

## Purpose

- **Story Generation**: This service allows users to transform personal diary entries into fictionalized, emotionally immersive stories. It leverages a detailed prompt structure to provide rich, personalized narratives.
  
- **Conversational AI**: The `/chat` endpoint uses conversation history (previous messages) to generate context-aware responses. This helps simulate an ongoing dialogue, making the interaction feel more natural and dynamic.

## Ports & Configuration

- **Service Port**: `7000`
- **Backend Model Port**: `1234` (This is the port where the LM Studio API is hosted. Please ensure that the backend model is running and accessible on this port.)
  
## API Endpoints

### 1. `/generate-story`
- **Method**: `POST`
- **Description**: Accepts an annotated diary entry and generates a fictionalized story based on the provided input.
- **Request Body**:
  ```json
  {
    "diary_entry": "Your annotated diary entry here."
  }
  ```
- **Response**:
  ```json
  {
    "story": "Generated story content here."
  }
  ```

### 2. `/chat`
- **Method**: `POST`
- **Description**: Accepts the latest user message along with previous messages to generate a response while maintaining conversational context.
- **Request Body**:
  ```json
  {
    "latest_msg": "User's latest message here",
    "prev_msgs": [
      "Previous message 1",
      "Previous message 2"
    ]
  }
  ```
- **Response**:
  ```json
  {
    "response": "Generated AI response based on conversation context."
  }
  ```

## CORS Configuration

This service is configured to allow requests from `http://0.0.0.0:8000`. This enables frontend applications running on this origin to interact with the service.

### Allowed Methods:
- `GET`, `POST`

### Allowed Headers:
- `*` (All headers are allowed)

## Running the Service

To run the service locally, use the following command:

```bash
uvicorn main:app --host 0.0.0.0 --port 7000 --reload
```

This will start the FastAPI server on port `7000`, and the service will be accessible at `http://localhost:7000`.

## Dependencies

Ensure that the following dependencies are installed:
- `fastapi`
- `uvicorn`
- `http.client`
- `pydantic`

You can install the required dependencies using `pip`:

```bash
pip install fastapi uvicorn pydantic
```

## Example Usage

1. Start the FastAPI service on port `7000`.
2. Send `POST` requests to `/generate-story` or `/chat` using tools like `Postman` or `curl`.
3. The service will generate the respective responses based on the provided input.

---

**Note**: The service expects the LM Studio API to be running and accessible on `localhost:1234` for generating model responses. Please ensure the model is available and properly configured.
