import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {Link } from "react-router-dom";

interface ChatBubbleProps {
    message: string;
    isUser: boolean;
}

export default function ChatBubble({ message, isUser }: ChatBubbleProps) {


    return (
        <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
            <div
                className={cn(
                    "rounded-2xl py-3 px-4 max-w-[80%] text-sm md:text-base shadow-md",
                    isUser
                        ? "bg-gray-200 text-gray-900"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                )}
            >
                <p>{message}</p>
            </div>



        </div>
    );
}
