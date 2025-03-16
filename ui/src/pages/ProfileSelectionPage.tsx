import { JSX, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/context/ProfileContext";
import { Profile } from "@/types";

export default function ProfileList(): JSX.Element {
    const { getAllProfiles, setUsedProfileId } = useProfile();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const data = await getAllProfiles();
                setProfiles(data);
            } catch (error) {
                console.error("DEBUG: Error fetching profiles:", error);
            }
        };
        fetchProfiles();
    }, [getAllProfiles]);

    // Return a specific image URL for first and second profiles
    const getCardImage = (profile: Profile): string => {
        if (profile.id === 1) {
            return "https://images.unsplash.com/photo-1547212371-eb5e6a4b590c?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
        } else if (profile.id === 2) {
            return "https://i.pravatar.cc/400?img=2";
        } else {
            return `https://source.unsplash.com/400x300/?portrait&sig=${profile.id}`;
        }
    };

    const handleUsePersona = () => {
        if (!selectedProfile) return;
        setUsedProfileId(selectedProfile.id);
        console.log("DEBUG: Using profile with id:", selectedProfile.id);
        navigate("/ai");
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 py-20 px-8 text-center">
            <h2 className="text-5xl font-extrabold">Profiles</h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {profiles.map((profile) => (
                    <motion.div
                        key={profile.id}
                        whileHover={{ scale: 1.05 }}
                        className="overflow-hidden rounded-xl shadow-md bg-gray-50 cursor-pointer border border-gray-200"
                        onClick={() => setSelectedProfile(profile)}
                    >
                        <img
                            src={getCardImage(profile)}
                            alt="Profile Image"
                            className="w-full h-56 object-cover"
                        />
                        <Card className="p-6 bg-white">
                            <h3 className="text-2xl font-semibold">{profile.full_name}</h3>
                            <p className="text-gray-600">{profile.nickname}</p>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {selectedProfile && (
                <Dialog open={true} onOpenChange={() => setSelectedProfile(null)}>
                    <DialogContent className="bg-white text-gray-900 max-w-2xl mx-auto p-8 rounded-lg overflow-y-auto max-h-screen">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DialogTitle className="text-3xl font-bold mb-4">
                                {selectedProfile.full_name}
                            </DialogTitle>
                            <img
                                src={getCardImage(selectedProfile)}
                                alt="Profile Image"
                                className="w-full h-64 object-cover rounded-lg mb-4"
                            />
                            <div className="text-gray-700 text-left space-y-3">
                                <p>
                                    <strong>Nickname:</strong> {selectedProfile.nickname}
                                </p>
                                <p>
                                    <strong>Gender:</strong> {selectedProfile.gender}
                                </p>
                                <p>
                                    <strong>Age:</strong> {selectedProfile.age}
                                </p>
                                <p>
                                    <strong>Date of Birth:</strong> {selectedProfile.date_of_birth}
                                </p>
                                <p>
                                    <strong>Place of Birth:</strong> {selectedProfile.place_of_birth}
                                </p>
                                <p>
                                    <strong>Nationality:</strong> {selectedProfile.nationality}
                                </p>
                                <p>
                                    <strong>Languages Spoken:</strong>{" "}
                                    {selectedProfile.languages_spoken.join(", ")}
                                </p>
                                <p>
                                    <strong>Religion:</strong> {selectedProfile.religion}
                                </p>
                                <p>
                                    <strong>Caste:</strong> {selectedProfile.caste}
                                </p>
                                <p>
                                    <strong>Marital Status:</strong> {selectedProfile.marital_status}
                                </p>
                                <div>
                                    <strong>Current Residence:</strong>
                                    <p>City: {selectedProfile.current_residence.city}</p>
                                    <p>State: {selectedProfile.current_residence.state}</p>
                                    <p>Country: {selectedProfile.current_residence.country}</p>
                                    <p>
                                        Living Status: {selectedProfile.current_residence.living_status}
                                    </p>
                                    <p>
                                        Residence Type: {selectedProfile.current_residence.residence_type}
                                    </p>
                                    <p>
                                        <strong>House Description:</strong>
                                    </p>
                                    <ul className="list-disc ml-5">
                                        <li>
                                            <strong>Interior:</strong> Garden:{" "}
                                            {
                                                selectedProfile.current_residence.house_description.interior
                                                    .garden
                                            }
                                        </li>
                                        <li>
                                            Bedroom:{" "}
                                            {
                                                selectedProfile.current_residence.house_description.interior
                                                    .bedroom
                                            }
                                        </li>
                                        <li>
                                            Kitchen:{" "}
                                            {
                                                selectedProfile.current_residence.house_description.interior
                                                    .kitchen
                                            }
                                        </li>
                                        <li>
                                            Living Room:{" "}
                                            {
                                                selectedProfile.current_residence.house_description.interior
                                                    .living_room
                                            }
                                        </li>
                                    </ul>
                                    <p>
                                        Roof Type:{" "}
                                        {selectedProfile.current_residence.house_description.roof_type}
                                    </p>
                                    <p>
                                        Front Door:{" "}
                                        {selectedProfile.current_residence.house_description.front_door}
                                    </p>
                                    <p>
                                        Paint Color:{" "}
                                        {selectedProfile.current_residence.house_description.paint_color}
                                    </p>
                                </div>
                                <div>
                                    <strong>Previous Residence:</strong>
                                    <p>
                                        Location: {selectedProfile.previous_residence.location}
                                    </p>
                                    <p>
                                        Reason for Change:{" "}
                                        {selectedProfile.previous_residence.reason_for_change}
                                    </p>
                                </div>
                                <div>
                                    <strong>Personal Details:</strong>
                                    <p>Height: {selectedProfile.personal_details.height}</p>
                                    <p>Weight: {selectedProfile.personal_details.weight}</p>
                                    <p>Posture: {selectedProfile.personal_details.posture}</p>
                                    <p>Eye Color: {selectedProfile.personal_details.eye_color}</p>
                                    <p>Blood Type: {selectedProfile.personal_details.blood_type}</p>
                                    <p>Hair Color: {selectedProfile.personal_details.hair_color}</p>
                                    <p>Skin Color: {selectedProfile.personal_details.skin_color}</p>
                                    <p>
                                        Medications:{" "}
                                        {selectedProfile.personal_details.medications.join(", ")}
                                    </p>
                                    <p>
                                        Health Issues:{" "}
                                        {selectedProfile.personal_details.health_issues.join(", ")}
                                    </p>
                                    <p>
                                        Hearing Assistance:{" "}
                                        {selectedProfile.personal_details.hearing_assistance}
                                    </p>
                                </div>
                                <div>
                                    <strong>Appearance:</strong>
                                    <p>
                                        Facial Features: Eyes: {selectedProfile.appearance.facial_features.eyes},
                                        Beard: {selectedProfile.appearance.facial_features.beard},
                                        Wrinkles: {selectedProfile.appearance.facial_features.wrinkles},
                                        Face Shape: {selectedProfile.appearance.facial_features.face_shape}
                                    </p>
                                    <p>
                                        Physical Changes: Aging: {selectedProfile.appearance.physical_changes.aging},
                                        Mobility: {selectedProfile.appearance.physical_changes.mobility}
                                    </p>
                                </div>
                                <div>
                                    <strong>Interests and Hobbies:</strong>
                                    <p>
                                        Cooking: Specialties:{" "}
                                        {selectedProfile.interests_and_hobbies.cooking.specialties.join(", ")},
                                        Favorite Dish: {selectedProfile.interests_and_hobbies.cooking.favorite_dish_to_prepare}
                                    </p>
                                    <p>
                                        Reading: Books:{" "}
                                        {selectedProfile.interests_and_hobbies.reading.books.join(", ")},
                                        Activities: {selectedProfile.interests_and_hobbies.reading.activities}
                                    </p>
                                    <p>
                                        Gardening: Plants:{" "}
                                        {selectedProfile.interests_and_hobbies.gardening.plants.join(", ")},
                                        Gardening Style: {selectedProfile.interests_and_hobbies.gardening.gardening_style}
                                    </p>
                                    <p>
                                        Music and Art: Interests:{" "}
                                        {selectedProfile.interests_and_hobbies.music_and_art.interests},
                                        Activities: {selectedProfile.interests_and_hobbies.music_and_art.activities}
                                    </p>
                                    <p>
                                        Religious Practices: Temple Visits:{" "}
                                        {selectedProfile.interests_and_hobbies.religious_practices.temple_visits},
                                        Prayer Routine: {selectedProfile.interests_and_hobbies.religious_practices.prayer_routine}
                                    </p>
                                </div>
                                <div>
                                    <strong>Social Interactions:</strong>
                                    <div>
                                        <p><strong>Family:</strong></p>
                                        {selectedProfile.social_interactions.family.son_1 && (
                                            <p>
                                                Son 1: {selectedProfile.social_interactions.family.son_1.name} (
                                                {selectedProfile.social_interactions.family.son_1.age} years old)
                                            </p>
                                        )}
                                        {selectedProfile.social_interactions.family.son_2 && (
                                            <p>
                                                Son 2: {selectedProfile.social_interactions.family.son_2.name} (
                                                {selectedProfile.social_interactions.family.son_2.age} years old)
                                            </p>
                                        )}
                                        {selectedProfile.social_interactions.family.daughter && (
                                            <p>
                                                Daughter: {selectedProfile.social_interactions.family.daughter.name} (
                                                {selectedProfile.social_interactions.family.daughter.age} years old)
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p>
                                            <strong>Friends:</strong>{" "}
                                            {selectedProfile.social_interactions.friends.close_friends
                                                .map((friend) => friend.name)
                                                .join(", ")}
                                        </p>
                                    </div>
                                    <div>
                                        <p>
                                            <strong>Grandchildren:</strong>{" "}
                                            {selectedProfile.social_interactions.grandchildren
                                                .map((gc) => gc.name)
                                                .join(", ")}
                                        </p>
                                    </div>
                                    <div>
                                        <p>
                                            <strong>Social Media and Technology:</strong>
                                            <br />
                                            Radio:{" "}
                                            {selectedProfile.social_interactions.social_media_and_technology.radio.interests.join(", ")}
                                            <br />
                                            Television:{" "}
                                            {selectedProfile.social_interactions.social_media_and_technology.television.interests.join(", ")}
                                            <br />
                                            Mobile Phone:{" "}
                                            {selectedProfile.social_interactions.social_media_and_technology.mobile_phone.brand} -{" "}
                                            {selectedProfile.social_interactions.social_media_and_technology.mobile_phone.uses.join(", ")}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <strong>Work and Education:</strong>
                                    <p>
                                        Career: {selectedProfile.work_and_education.career.profession}
                                    </p>
                                    <p>
                                        Retirement Year: {selectedProfile.work_and_education.career.retirement.year}
                                    </p>
                                    <p>
                                        Retirement Celebration: {selectedProfile.work_and_education.career.retirement.retirement_celebration}
                                    </p>
                                    <p>
                                        School Name: {selectedProfile.work_and_education.career.school_name}
                                    </p>
                                    <p>
                                        Subjects Taught: {selectedProfile.work_and_education.career.subjects_taught.join(", ")}
                                    </p>
                                    <p>
                                        Years of Service: {selectedProfile.work_and_education.career.years_of_service}
                                    </p>
                                    <p>
                                        Post Retirement Activities: {selectedProfile.work_and_education.post_retirement.activities.join(", ")}
                                    </p>
                                </div>
                                <div>
                                    <strong>Important Life Events:</strong>
                                    {selectedProfile.important_life_events.map((event, idx) => (
                                        <div key={idx} className="border-t border-gray-300 pt-2 mt-2">
                                            <p>
                                                <strong>Date:</strong> {event.date}
                                            </p>
                                            <p>
                                                <strong>Event:</strong> {event.event}
                                            </p>
                                            <p>
                                                <strong>Description:</strong> {event.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Modal footer with two buttons */}
                            <div className="mt-6 flex space-x-4">
                                <Button
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                    onClick={() => {
                                        console.log("DEBUG: More Info clicked");
                                    }}
                                >
                                    More Info
                                </Button>
                                <Button
                                    className="w-full bg-black hover:bg-gray-800 text-white"
                                    onClick={handleUsePersona}
                                >
                                    Use Persona
                                </Button>
                            </div>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
