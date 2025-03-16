import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import AudioVisualizer from "@/components/AudioVisualizer";
import ChatBubble from "@/components/ChatBubble";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useVoiceAssistant } from "@/context/VoiceAssistantContext";

type Mode = "chat" | "story";

export default function VoiceAssistant() {
    const [isListening, setIsListening] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [conversation, setConversation] = useState<{ text: string; isUser: boolean }[]>([]);
    const [currentPitch, setCurrentPitch] = useState(0);
    const [mode, setMode] = useState<Mode>("chat");
    const [textInput, setTextInput] = useState("");
    const [refAudio, setRefAudio] = useState<File | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const { getChat, getStory, getVoice } = useVoiceAssistant();

    // Initialize audio context and analyser.
    useEffect(() => {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        return () => {
            if (audioContextRef.current?.state !== "closed") {
                audioContextRef.current.close();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Speech recognition for Chat Mode.
    const startSpeechRecognition = () => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition API not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (
            event: SpeechRecognitionEvent & { results: SpeechRecognitionResultList }
        ) => {
            const transcript = event.results[0][0].transcript;
            console.log("Speech recognition transcript:", transcript);
            setConversation((prev) => [...prev, { text: transcript, isUser: true }]);
            handleResponse(transcript);
        };
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        setIsListening(true);
        recognition.start();
    };

    // For Story Mode: trigger story generation.
    const handleStory = async () => {
        console.log("Story mode triggered");
        setConversation((prev) => [...prev, { text: "Generate Story", isUser: true }]);
        await handleResponse("Generate Story");
    };

    // Manual text submission for Chat Mode.
    const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!textInput.trim()) return;
        const message = textInput.trim();
        console.log("Manual submit:", message);
        setConversation((prev) => [...prev, { text: message, isUser: true }]);
        setTextInput("");
        await handleResponse(message);
    };

    // Helper to decode a base64 string into a Blob.
    const base64ToBlob = (base64: string, mimeType: string) => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    };

    // Play audio from a base64-encoded string.
    const playAudio = async (base64Audio: string) => {
        console.log("Playing audio...");
        const blob = base64ToBlob(base64Audio, "audio/mpeg");
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        await audio.play();
        console.log("Audio played successfully.");
    };

    // Handle AI response: get text output then synthesize voice and play it.
    const handleResponse = async (userMessage: string) => {
        console.log("handleResponse called with:", userMessage);
        if (!refAudio) {
            alert("Please upload a reference audio file first.");
            return;
        }
        setIsAiSpeaking(true);
        try {
            let responseText = "";
            if (mode === "chat") {
                const previousMsgs = conversation
                    .filter((msg) => msg.isUser)
                    .slice(-5)
                    .map((msg) => msg.text);
                console.log("Previous messages for chat context:", previousMsgs);
                const chatResponse = await getChat(userMessage, previousMsgs);
                responseText = chatResponse.response;
            } else if (mode === "story") {
                const storyResponse = await getStory();
                // Check both keys: "enhanced_story" or "story"
                responseText = storyResponse.enhanced_story || storyResponse.story;
                console.log("Story response received:", storyResponse);
            }
            console.log("Received responseText:", responseText);

            // Check if responseText is valid.
            if (typeof responseText !== "string" || !responseText) {
                console.error("Invalid or empty responseText:", responseText);
                setIsAiSpeaking(false);
                return;
            }

            // Call /voice endpoint using the reference audio.
            const voiceResponse = await getVoice("default", responseText, refAudio);
            console.log("Voice response received:", voiceResponse);

            // Check if audio_data is a JSON string.
            let audioData = voiceResponse.audio_data;
            try {
                const parsed = JSON.parse(audioData);
                if (parsed && parsed.audio_data) {
                    console.log("Parsed nested audio_data from JSON.");
                    audioData = parsed.audio_data;
                }
            } catch (e) {
                console.log("audio_data is not JSON wrapped, using raw value.");
            }

            // Play the synthesized audio.
            await playAudio(audioData);

            // Simulate typing effect to display text response.
            console.log("Starting typing effect for response text.");
            let displayedResponse = "";
            let index = 0;
            const typingInterval = setInterval(() => {
                console.log("Typing interval: index", index, "of", responseText.length);
                if (index < responseText.length) {
                    displayedResponse += responseText[index];
                    setConversation((prev) => {
                        const newConversation = [...prev];
                        if (
                            newConversation.length > 0 &&
                            !newConversation[newConversation.length - 1].isUser
                        ) {
                            newConversation[newConversation.length - 1].text = displayedResponse;
                        } else {
                            newConversation.push({ text: displayedResponse, isUser: false });
                        }
                        return newConversation;
                    });
                    index++;
                } else {
                    clearInterval(typingInterval);
                    setIsAiSpeaking(false);
                    console.log("Typing effect complete.");
                }
            }, 30);
        } catch (error) {
            console.error("Error handling response:", error);
            setIsAiSpeaking(false);
        }
    };

    // For Chat Mode: use microphone for input.
    const startListening = () => {
        startSpeechRecognition();
    };

    const stopListening = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        setIsListening(false);
    };

    // Handle reference audio file selection.
    const handleRefAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            console.log("Reference audio selected:", e.target.files[0].name);
            setRefAudio(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* If no reference audio, prompt the user to upload one */}
            {!refAudio && (
                <div className="bg-white p-4 m-4 rounded shadow text-center">
                    <p className="mb-2">Please upload a reference audio file:</p>
                    <input type="file" accept="audio/*" onChange={handleRefAudioChange} />
                </div>
            )}
            <main className="flex-1 p-4 md:p-8 flex flex-col">
                {/* Mode Toggle */}
                <div className="flex justify-center gap-4 mb-4">
                    <Button onClick={() => setMode("chat")} variant={mode === "chat" ? "default" : "outline"}>
                        Chat Mode
                    </Button>
                    <Button onClick={() => setMode("story")} variant={mode === "story" ? "default" : "outline"}>
                        Story Mode
                    </Button>
                </div>
                <div className="flex-1 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto w-full">
                    {/* Left Section: Audio Visualizer and Microphone Controls */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-6 relative">
                        <div className="w-full h-64 md:h-96 flex items-center justify-center">
                            <AudioVisualizer isListening={isListening} isAiSpeaking={isAiSpeaking} pitch={currentPitch} />
                        </div>
                        <div className="absolute bottom-8 flex gap-4">
                            <Button
                                size="lg"
                                variant={isListening ? "destructive" : "default"}
                                className="rounded-full w-16 h-16 flex items-center justify-center"
                                onClick={mode === "story" ? handleStory : startListening}
                            >
                                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                            </Button>
                            {isAiSpeaking && (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full w-16 h-16 flex items-center justify-center bg-blue-50"
                                >
                                    <Volume2 size={24} className="text-blue-500" />
                                </Button>
                            )}
                        </div>
                    </div>
                    {/* Right Section: Conversation History */}
                    <div className="flex-1 bg-white rounded-xl shadow-lg p-6 overflow-y-auto max-h-[80vh]">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Conversation</h2>
                        <div className="space-y-4">
                            {conversation.length === 0 && (
                                <p className="text-gray-500 italic text-center">
                                    {mode === "chat"
                                        ? "Speak using the microphone or type your message below."
                                        : "Generate a story by clicking the microphone button."}
                                </p>
                            )}
                            {conversation.map((message, index) => (
                                <ChatBubble key={index} message={message.text} isUser={message.isUser} />
                            ))}
                        </div>
                        {/* Manual Text Input for Chat Mode */}
                        {mode === "chat" && (
                            <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border rounded"
                                    placeholder="Type your message..."
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                />
                                <Button type="submit">Send</Button>
                            </form>
                        )}
                        {/* Input to update reference audio */}
                        <div className="mt-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Change Reference Audio:
                            </label>
                            <input type="file" accept="audio/*" onChange={handleRefAudioChange} />
                        </div>
                    </div>
                </div>
            </main>
            <div className="flex justify-center w-full">
                <Link to="/memories">
                    <Button className="mt-2 text-sm" variant="outline">
                        Add Stories
                    </Button>
                </Link>
            </div>
            <footer className="p-4 text-center text-gray-500 text-sm">
                Voice Interface Demo • Powered by AI SDK
            </footer>
        </div>
    );
}
