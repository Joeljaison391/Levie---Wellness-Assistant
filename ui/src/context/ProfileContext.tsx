import { createContext, useContext, ReactNode, useState } from 'react';
import { Profile } from '@/types';

const API_BASE_URL = "http://0.0.0.0:6040";

interface ProfileContextProps {
    createProfile: (profile: Profile) => Promise<Profile>;
    getProfile: (id: number, include_embeddings?: boolean) => Promise<Profile>;
    getAllProfiles: () => Promise<Profile[]>;
    usedProfileId: number | null;
    setUsedProfileId: (id: number | null) => void;
}

const ProfileContext = createContext<ProfileContextProps | undefined>(undefined);

interface ProfileProviderProps {
    children: ReactNode;
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
    const [usedProfileId, setUsedProfileId] = useState<number | null>(null);

    const createProfile = async (profile: Profile): Promise<Profile> => {
        console.log("DEBUG: Creating profile with data:", profile);
        try {
            const response = await fetch(`${API_BASE_URL}/profiles/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            });
            const data = await response.json();
            console.log("DEBUG: Profile created successfully:", data);
            return data;
        } catch (error) {
            console.error("DEBUG: Error creating profile:", error);
            throw error;
        }
    };

    const getProfile = async (id: number, include_embeddings: boolean = false): Promise<Profile> => {
        console.log(`DEBUG: Fetching profile with id ${id} and include_embeddings=${include_embeddings}`);
        try {
            const response = await fetch(`${API_BASE_URL}/profiles/${id}?include_embeddings=${include_embeddings}`);
            const data = await response.json();
            console.log("DEBUG: Fetched profile:", data);
            return data;
        } catch (error) {
            console.error("DEBUG: Error fetching profile:", error);
            throw error;
        }
    };

    const getAllProfiles = async (): Promise<Profile[]> => {
        console.log("DEBUG: Fetching all profiles");
        try {
            const response = await fetch(`${API_BASE_URL}/all-profiles/`);
            const data = await response.json();
            console.log("DEBUG: Fetched all profiles:", data);
            return data;
        } catch (error) {
            console.error("DEBUG: Error fetching all profiles:", error);
            throw error;
        }
    };

    return (
        <ProfileContext.Provider
            value={{
                createProfile,
                getProfile,
                getAllProfiles,
                usedProfileId,
                setUsedProfileId,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = (): ProfileContextProps => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};
