import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

// Define the Memory type based on the API response structure
export interface Memory {
    id: number;
    diary_text: string;
    annotated_story?: string;
    personal_data: any;
    annotations?: any;
    ai_enhanced_annotations?: any;
}

// Define the context interface with state and API methods
interface MemoryContextType {
    memoryCount: number | null;
    memory: Memory | null;
    stories: Memory[];
    loading: boolean;
    getMemoryCount: () => Promise<void>;
    getMemory: (memoryId: number) => Promise<void>;
    annotateDiaryEntry: (diaryEntry: string, personalId: string) => Promise<void>;
    getAllStories: () => Promise<void>;
}

// Create the context with undefined as the default
const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

interface MemoryProviderProps {
    children: ReactNode;
}

export const MemoryProvider: React.FC<MemoryProviderProps> = ({ children }) => {
    const [memoryCount, setMemoryCount] = useState<number | null>(null);
    const [memory, setMemory] = useState<Memory | null>(null);
    const [stories, setStories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Use an environment variable or fallback URL
    const baseUrl: string = "http://localhost:6060";

    // Memoize API functions so their references remain stable

    const getMemoryCount = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch(`${baseUrl}/memory/count`);
            if (!response.ok) {
                throw new Error("Failed to fetch memory count");
            }
            const data = await response.json();
            setMemoryCount(data.count);
        } catch (error) {
            console.error("Error in getMemoryCount:", error);
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    const getMemory = useCallback(async (memoryId: number): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch(`${baseUrl}/memory/${memoryId}`);
            if (!response.ok) {
                throw new Error("Memory not found");
            }
            const data: Memory = await response.json();
            setMemory(data);
        } catch (error) {
            console.error("Error in getMemory:", error);
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    const getAllStories = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch(`${baseUrl}/stories/`);
            if (!response.ok) {
                throw new Error("Failed to fetch stories");
            }
            const data: Memory[] = await response.json();
            setStories(data);
        } catch (error) {
            console.error("Error in getAllStories:", error);
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    const annotateDiaryEntry = useCallback(async (diaryEntry: string, personalId: string): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch(`${baseUrl}/annotate/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    diary_entry: diaryEntry,
                    personal_id: personalId,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to annotate diary entry");
            }
            await response.json();
        } catch (error) {
            console.error("Error in annotateDiaryEntry:", error);
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    return (
        <MemoryContext.Provider
            value={{
                memoryCount,
                memory,
                stories,
                loading,
                getMemoryCount,
                getMemory,
                annotateDiaryEntry,
                getAllStories,
            }}
        >
            {children}
        </MemoryContext.Provider>
    );
};

// Custom hook to consume the MemoryContext
export const useMemory = (): MemoryContextType => {
    const context = useContext(MemoryContext);
    if (!context) {
        throw new Error("useMemory must be used within a MemoryProvider");
    }
    return context;
};
