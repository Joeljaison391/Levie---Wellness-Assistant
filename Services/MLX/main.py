from fastapi import FastAPI, UploadFile, File
import subprocess
from pathlib import Path
import os
import uvicorn
import scipy.io.wavfile as wav
from TTS.api import TTS
import torch

# 🔹 Detect MPS (Metal GPU) on Mac
device = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"Using device: {device}")

app = FastAPI(
    title="Coqui TTS Voice Cloning API",
    description="A FastAPI-based service for voice cloning using Coqui TTS (your_tts) with MPS acceleration.",
    version="1.0.0"
)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

Path(UPLOAD_FOLDER).mkdir(exist_ok=True)
Path(OUTPUT_FOLDER).mkdir(exist_ok=True)

# 🔹 Load Coqui TTS voice cloning model
tts = TTS("tts_models/multilingual/multi-dataset/your_tts").to(device)

@app.get("/")
async def root():
    return {"message": "Coqui TTS Voice Cloning API with MPS is running!"}


@app.post("/clone-voice-from-audio/")
async def clone_voice(text: str, audio_file: UploadFile = File(...)):
    """
    Clones the voice from the uploaded audio file and generates speech for the given text.
    """
    file_path = f"{UPLOAD_FOLDER}/{audio_file.filename}"
    output_audio_path = f"{OUTPUT_FOLDER}/cloned_output.wav"

    # Save the uploaded file
    with open(file_path, "wb") as f:
        f.write(audio_file.file.read())

    # Convert audio to required format using ffmpeg
    converted_audio = f"{UPLOAD_FOLDER}/converted_audio.wav"
    subprocess.run([
        "ffmpeg", "-i", file_path, "-ac", "1", "-ar", "24000",
        "-sample_fmt", "s16", "-t", "10", converted_audio
    ], check=True)

    # 🔹 Generate cloned voice with Coqui TTS using the reference speaker sample
    tts.tts_to_file(
        text=text,
        speaker_wav=converted_audio,
        language="en",  # Change if using other languages
        file_path=output_audio_path
    )

    return {"message": "Voice cloning completed!", "output_audio": output_audio_path}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=False)
