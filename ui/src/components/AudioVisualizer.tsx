"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
    isListening: boolean;
    isAiSpeaking: boolean;
    pitch: number;
}

export default function AudioVisualizer({ isListening, isAiSpeaking, pitch }: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas dimensions
        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        const animate = () => {
            if (!ctx || !canvas) return;

            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);

            let color = "#444444"; // Default gray
            if (isListening) {
                color = "#9333ea"; // Purple when listening
            } else if (isAiSpeaking) {
                color = "#3b82f6"; // Blue when AI is speaking
            }

            const centerX = width / 2;
            const centerY = height / 2;
            const baseRadius = Math.min(width, height) * 0.4;
            const numCircles = 50;
            const maxAmplitude = baseRadius * 0.2;
            const time = Date.now() * 0.001;
            const speed = 1 + (pitch / 100) * 4;

            for (let i = 0; i < numCircles; i++) {
                const normalizedIndex = i / numCircles;
                const radius = baseRadius * normalizedIndex;
                const angle = time * speed + i * 0.1;
                const waveAmplitude = maxAmplitude * (isListening || isAiSpeaking ? 0.5 + Math.sin(angle) * 0.5 : 0.1);
                const deformation = Math.sin(normalizedIndex * Math.PI * 8 + time * speed) * waveAmplitude;
                const adjustedRadius = Math.max(1, radius + deformation);
                const opacity = 0.8 - normalizedIndex * 0.7;

                ctx.beginPath();
                ctx.arc(centerX, centerY, adjustedRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, "0")}`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", updateCanvasSize);
        };
    }, [isListening, isAiSpeaking, pitch]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full rounded-lg"
            style={{
                backgroundColor: isListening
                    ? "rgba(147, 51, 234, 0.05)"
                    : isAiSpeaking
                        ? "rgba(59, 130, 246, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
            }}
        />
    );
}
