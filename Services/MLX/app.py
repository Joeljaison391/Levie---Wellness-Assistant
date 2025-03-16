from fastapi import FastAPI, UploadFile, File
import subprocess
from pathlib import Path
import os
import uvicorn

app = FastAPI(
    title="F5-TTS-MLX Voice Cloning API",
    description="A FastAPI-based service for voice cloning using F5-TTS-MLX.",
    version="1.0.0"
)

UPLOAD_FOLDER = "uploads"
Path(UPLOAD_FOLDER).mkdir(exist_ok=True)


@app.get("/")
async def root():
    return {"message": "F5-TTS-MLX Voice Cloning API is running!"}


@app.post("/clone-voice/")
async def clone_voice(text: str, audio_file: UploadFile = File(...)):
    """
    Clones the voice from the uploaded audio file and generates speech for the given text.
    """
    file_path = f"{UPLOAD_FOLDER}/{audio_file.filename}"
    output_audio = f"{UPLOAD_FOLDER}/cloned_output.wav"

    # Save the uploaded file
    with open(file_path, "wb") as f:
        f.write(audio_file.file.read())

    # Convert audio to required format using ffmpeg
    converted_audio = f"{UPLOAD_FOLDER}/converted_audio.wav"
    subprocess.run([
        "ffmpeg", "-i", file_path, "-ac", "1", "-ar", "24000",
        "-sample_fmt", "s16", "-t", "10", converted_audio
    ], check=True)

    # Run F5-TTS-MLX for voice cloning
    command = [
        "python", "-m", "f5_tts_mlx.generate",
        "--text", text,
        "--ref-audio", converted_audio,
        "--ref-text", text
    ]
    subprocess.run(command, check=True)

    return {"message": "Voice cloning completed!", "output_audio": output_audio}


if __name__ == "__main__":
    # Run without reload mode when executed as a script
    uvicorn.run("app:app", host="0.0.0.0", port=8080, reload=False)

