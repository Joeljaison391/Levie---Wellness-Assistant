import { createContext, useContext, useState, ReactNode } from 'react';

// Define response interfaces based on backend endpoints.
export interface AnalyzeInteractionResponse {
    message: string;
}

export interface StoryResponse {
    enhanced_story: string;
}

export interface ChatResponse {
    response: string;
}

export interface VoiceResponse {
    audio_data: string;
}

export interface VoiceAssistantContextType {
    loading: boolean;
    error: Error | null;
    analyzeInteraction: () => Promise<AnalyzeInteractionResponse>;
    getStory: () => Promise<StoryResponse>;
    getChat: (latestMsg: string, prevMsgs: string[]) => Promise<ChatResponse>;
    getVoice: (
        voiceType: string,
        text: string,
        refAudio: File,
        style?: string,
        language?: string,
        speed?: string
    ) => Promise<VoiceResponse>;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

interface VoiceAssistantProviderProps {
    children: ReactNode;
}

export const VoiceAssistantProvider: React.FC<VoiceAssistantProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const analyzeInteraction = async (): Promise<AnalyzeInteractionResponse> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/analyze-interaction');
            if (!response.ok) {
                throw new Error('Error analyzing interaction');
            }
            return await response.json();
        } catch (err) {
            setError(err as Error);
            console.error('analyzeInteraction error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getStory = async (): Promise<StoryResponse> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/story');
            if (!response.ok) {
                throw new Error('Error fetching story');
            }
            return await response.json();
        } catch (err) {
            setError(err as Error);
            console.error('getStory error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getChat = async (latestMsg: string, prevMsgs: string[]): Promise<ChatResponse> => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('latest_msg', latestMsg);
            formData.append('prev_msgs', JSON.stringify(prevMsgs));

            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Error fetching chat response');
            }
            return await response.json();
        } catch (err) {
            setError(err as Error);
            console.error('getChat error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getVoice = async (
        voiceType: string,
        text: string,
        refAudio: File,
        style: string = 'default',
        language: string = 'English',
        speed: string = '1'
    ): Promise<VoiceResponse> => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('voice_type', voiceType);
            formData.append('text', text);
            formData.append('ref_audio', refAudio);
            formData.append('style', style);
            formData.append('language', language);
            formData.append('speed', speed);

            const response = await fetch('http://localhost:8000/voice', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Error generating voice audio');
            }
            return await response.json();
        } catch (err) {
            setError(err as Error);
            console.error('getVoice error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <VoiceAssistantContext.Provider
            value={{
                loading,
                error,
                analyzeInteraction,
                getStory,
                getChat,
                getVoice,
            }}
        >
            {children}
        </VoiceAssistantContext.Provider>
    );
};

export const useVoiceAssistant = (): VoiceAssistantContextType => {
    const context = useContext(VoiceAssistantContext);
    if (context === undefined) {
        throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
    }
    return context;
};
