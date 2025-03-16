import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import AudioVisualizer from "@/components/AudioVisualizer.tsx";
import ChatBubble from "@/components/ChatBubble.tsx";
import { Button } from "@/components/ui/button";
import {Link} from "react-router-dom";

export default function VoiceAssistant() {
    const [isListening, setIsListening] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [conversation, setConversation] = useState<{ text: string; isUser: boolean }[]>([]);
    const [currentPitch, setCurrentPitch] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Initialize audio context
    useEffect(() => {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        return () => {
            if (audioContextRef.current?.state !== "closed") {
                audioContextRef.current?.close();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const startListening = async () => {
        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current);
            source.connect(analyserRef.current!);

            setIsListening(true);
            const randomDuration = Math.floor(Math.random() * 3000) + 2000;
            setTimeout(() => {
                const userMessage = generateUserMessage();
                setConversation((prev) => [...prev, { text: userMessage, isUser: true }]);
                setIsListening(false);
                respondToUser(userMessage);
            }, randomDuration);

            const pitchInterval = setInterval(() => {
                setCurrentPitch(Math.random() * 100);
            }, 100);
            return () => clearInterval(pitchInterval);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopListening = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        setIsListening(false);
    };

    const generateUserMessage = () => {
        const userMessages = [
            "What's the weather like today?",
            "Tell me a fun fact about space",
            "How does machine learning work?",
            "What are some good books to read?",
            "Can you explain quantum computing?",
        ];
        return userMessages[Math.floor(Math.random() * userMessages.length)];
    };

    const respondToUser = (userMessage: string) => {
        setIsAiSpeaking(true);
        const aiResponses: Record<string, string> = {
            "What's the weather like today?": "It's sunny and 72°F with a light breeze.",
            "Tell me a fun fact about space": "One million Earths could fit inside the Sun!",
            "How does machine learning work?": "Machine learning finds patterns in data and makes predictions.",
            "What are some good books to read?": "Try 'Atomic Habits' by James Clear or 'Dune' by Frank Herbert.",
            "Can you explain quantum computing?": "Quantum computers use qubits to perform calculations exponentially faster than classical computers.",
        };
        const response = aiResponses[userMessage] || "I'm not sure how to respond to that.";
        let displayedResponse = "";
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < response.length) {
                displayedResponse += response[index];
                setConversation((prev) => {
                    const newConversation = [...prev];
                    if (newConversation.length > 0 && !newConversation[newConversation.length - 1].isUser) {
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
            }
        }, 30);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <main className="flex-1 p-4 md:p-8 flex flex-col">
                <div className="flex-1 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto w-full">
                    {/* Left section: Audio visualizer and controls */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-6 relative">
                        <div className="w-full h-64 md:h-96 flex items-center justify-center">
                            <AudioVisualizer isListening={isListening} isAiSpeaking={isAiSpeaking} pitch={currentPitch} />
                        </div>
                        <div className="absolute bottom-8 flex gap-4">
                            <Button
                                size="lg"
                                variant={isListening ? "destructive" : "default"}
                                className="rounded-full w-16 h-16 flex items-center justify-center"
                                onClick={isListening ? stopListening : startListening}
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
                    {/* Right section: Conversation history */}
                    <div className="flex-1 bg-white rounded-xl shadow-lg p-6 overflow-y-auto max-h-[80vh]">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Conversation</h2>
                        <div className="space-y-4">
                            {conversation.length === 0 && (
                                <p className="text-gray-500 italic text-center">Start speaking by clicking the microphone button</p>
                            )}
                            {conversation.map((message, index) => (
                                <ChatBubble key={index} message={message.text} isUser={message.isUser} />
                            ))}
                        </div>


                    </div>

                </div>
            </main>
            <div className="flex justify-center w-full">
                <Link to="/memories">
                    <Button className="mt-2 text-sm" variant="outline">
                        Add Memories
                    </Button>
                </Link>
            </div>

            <footer className="p-4 text-center text-gray-500 text-sm">Voice Interface Demo • Powered by AI SDK</footer>
        </div>
    );
}
