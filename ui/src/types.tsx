export interface Profile {
    id: number;
    full_name: string;
    nickname: string;
    gender: string;
    age: number;
    date_of_birth: string;
    place_of_birth: string;
    nationality: string;
    languages_spoken: string[];
    religion: string;
    caste: string;
    marital_status: string;
    current_residence: {
        city: string;
        state: string;
        country: string;
        living_status: string;
        residence_type: string;
        house_description: {
            interior: {
                garden: string;
                bedroom: string;
                kitchen: string;
                living_room: string;
            };
            roof_type: string;
            front_door: string;
            paint_color: string;
        };
    };
    previous_residence: {
        location: string;
        reason_for_change: string;
    };
    personal_details: {
        height: string;
        weight: string;
        posture: string;
        eye_color: string;
        blood_type: string;
        hair_color: string;
        skin_color: string;
        medications: string[];
        health_issues: string[];
        hearing_assistance: string;
    };
    appearance: {
        facial_features: {
            eyes: string;
            beard: string;
            wrinkles: string;
            face_shape: string;
        };
        physical_changes: {
            aging: string;
            mobility: string;
        };
    };
    interests_and_hobbies: {
        cooking: {
            specialties: string[];
            favorite_dish_to_prepare: string;
        };
        reading: {
            books: string[];
            activities: string;
        };
        gardening: {
            plants: string[];
            gardening_style: string;
        };
        music_and_art: {
            interests: string;
            activities: string;
        };
        religious_practices: {
            temple_visits: string;
            prayer_routine: string;
        };
    };
    social_interactions: {
        family: {
            daughter:{
                age: number;
                name: string;
                children: {
                    age: number;
                    name: string;
                }[];
                location: string;
                profession: string;
                relationship: string;
                marital_status: string;
            },
            son_1: {
                age: number;
                name: string;
                children: {
                    age: number;
                    name: string;
                }[];
                location: string;
                profession: string;
                relationship: string;
                marital_status: string;
            };
            son_2: {
                age: number;
                name: string;
                location: string;
                profession: string;
                relationship: string;
            };
        };
        friends: {
            close_friends: {
                age: number;
                name: string;
                profession: string;
                relationship: string;
            }[];
            community_involvement: string;
        };
        grandchildren: {
            age: number;
            name: string;
            relationship_with_grandmother: string;
        }[];
        social_media_and_technology: {
            radio: {
                interests: string[];
            };
            television: {
                interests: string[];
            };
            mobile_phone: {
                uses: string[];
                brand: string;
            };
        };
    };
    work_and_education: {
        career: {
            profession: string;
            retirement: {
                year: number;
                retirement_celebration: string;
            };
            school_name: string;
            subjects_taught: string[];
            years_of_service: number;
        };
        post_retirement: {
            activities: string[];
        };
    };
    important_life_events: {
        date: string;
        event: string;
        description: string;
    }[];
}
