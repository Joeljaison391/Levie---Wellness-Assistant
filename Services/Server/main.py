import random
import logging
import httpx
from fastapi import FastAPI, HTTPException, Request, Form, UploadFile, File  , Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS configuration: Allow origins matching ports 5000 to 5600 on localhost.
allowed_origin_regex = r"^http://localhost:(5[0-5]\d\d|5600)$"

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/analyze-interaction")
async def analyze_interaction():
    # Placeholder for analyzing interactions (no implementation yet)
    return {"message": "This is the analyze-interaction endpoint"}

@app.get("/story")
async def get_story():
    try:
        # Step 1: Get the total number of stories
        async with httpx.AsyncClient() as client:
            response = await client.get("http://0.0.0.0:6060/memory/count")
            response.raise_for_status()
            total_stories = response.json().get("count")

        # Select a random story ID
        story_id = random.randint(1, total_stories)

        # Fetch the story using the selected story ID
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://0.0.0.0:6060/memory/{story_id}")
            response.raise_for_status()
            story = response.json()

        # Annotated story text
        annotated_story = story.get("ai_enhanced_annotations").get("choices")[0].get("message").get("content")

        # Clean the annotated story
        annotated_story = annotated_story.replace("\n", " ").replace("\r", " ").replace("\t", " ").replace("  ", " ")

        # Step 2: Send the annotated story for further processing
        async with httpx.AsyncClient(timeout=60.0) as client:  # Increased timeout to 60 seconds
            payload = {"diary_entry": annotated_story}
            ai_enhanced_story_response = await client.post(
                "http://0.0.0.0:7000/generate-story", json=payload
            )
            ai_enhanced_story_response.raise_for_status()

        # Returning the enhanced story response as JSON
        return ai_enhanced_story_response.json()

    except httpx.RequestError as exc:
        logger.error(f"Request error: {exc}")
        raise HTTPException(status_code=500, detail=f"Request error: {exc}")
    except httpx.HTTPStatusError as exc:
        logger.error(f"HTTP error: {exc}")
        raise HTTPException(status_code=exc.response.status_code, detail=f"HTTP error: {exc}")
    except httpx.TimeoutException as exc:
        logger.error("Request timed out")
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as exc:
        logger.error(f"Unexpected error: {exc}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")


@app.get("/chat")
async def get_chat(
        latest_msg: str = Form(...),  # The most recent message
        prev_msgs: list = Form(...),  # A list of previous messages for context
):
    try:
        logger.debug(f"Latest message received: {latest_msg}")
        logger.debug(f"Previous messages received: {prev_msgs}")

        # Prepare the payload for the chat API
        payload = {
            "latest_msg": latest_msg,
            "prev_msgs": prev_msgs
        }

        # Step 1: Send the latest message and previous messages to the chat service
        async with httpx.AsyncClient(timeout=60.0) as client:  # Increased timeout to 60 seconds
            response = await client.post("http://0.0.0.0:7000/chat", json=payload)
            response.raise_for_status()

        # Step 2: Returning the enhanced response from the chat service
        logger.debug("Received response from chat service")
        return response.json()

    except httpx.RequestError as exc:
        logger.error(f"Request error occurred: {exc}")
        raise HTTPException(status_code=500, detail=f"Request error: {exc}")

    except httpx.HTTPStatusError as exc:
        logger.error(f"HTTP error occurred: {exc}")
        raise HTTPException(status_code=exc.response.status_code, detail=f"HTTP error: {exc}")

    except httpx.TimeoutException as exc:
        logger.error(f"Timeout error: {exc}")
        raise HTTPException(status_code=504, detail="Request timed out")

    except Exception as exc:
        logger.error(f"Unexpected error occurred: {exc}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")

@app.post("/voice")
async def get_voice(
    voice_type: str = Form(...),
    text: str = Form(...),
    ref_audio: UploadFile = File(...),
    style: str = Form("default"),
    language: str = Form("English"),
    speed: str = Form("1"),
):
    try:
        logger.debug(f"Voice type received: {voice_type}")
        logger.debug(f"Story text received: {text[:100]}...")  # Log the first 100 chars for debugging

        # Step 1: Send the received story text directly to the TTS service without refining it
        logger.debug(f"Sending story text to TTS service: {text[:100]}...")  # Log the first 100 chars
        async with httpx.AsyncClient(timeout=120.0) as client:
            files = {
                "text": (None, text),  # Directly use the received story text
                "ref_audio": (ref_audio.filename, ref_audio.file, "audio/mpeg"),  # Reference audio file
                "style": (None, style),  # Voice style
                "language": (None, language),  # Language
                "speed": (None, speed),  # Speed (adjust as needed)
            }

            response = await client.post(
                "http://0.0.0.0:6080/synthesize",
                files=files
            )

            response.raise_for_status()

        logger.debug(f"Received audio data from TTS service")
        return {"audio_data": response.content}

    except httpx.RequestError as exc:
        logger.error(f"Request error occurred: {exc}")
        if exc.request:
            logger.error(f"Request URL: {exc.request.url}")
            logger.error(f"Request Headers: {exc.request.headers}")
        if exc.response:
            logger.error(f"Response Status Code: {exc.response.status_code}")
            logger.error(f"Response Body: {exc.response.text}")
        raise HTTPException(status_code=500, detail=f"Request error: {exc}")
    except httpx.HTTPStatusError as exc:
        logger.error(f"HTTP error occurred: {exc}")
        if exc.response:
            logger.error(f"Response Status Code: {exc.response.status_code}")
            logger.error(f"Response Body: {exc.response.text}")
        raise HTTPException(status_code=exc.response.status_code, detail=f"HTTP error: {exc}")
    except httpx.TimeoutException as exc:
        logger.error("Request timed out")
        logger.error(f"Timeout error: {exc}")
        if exc.request:
            logger.error(f"Request URL: {exc.request.url}")
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as exc:
        logger.error(f"Unexpected error: {exc}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

