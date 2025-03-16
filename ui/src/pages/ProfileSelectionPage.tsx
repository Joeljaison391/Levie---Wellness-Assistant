import { JSX, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import personasData from "@/assets/persona.json";
import { motion } from "framer-motion";
import {Link} from "react-router-dom";

interface Persona {
    personalInfo: {
        username: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        placeOfBirth: string;
        dateOfBirth: string;
        age: number;
        gender: string;
    };
    education: {
        institutionName: string;
        level: string;
        fieldOfStudy: string;
        degree: string;
        startDate: string;
        endDate: string;
    }[];
    maritalStatus: string;
    spouse?: {
        name: string;
        marriageDate: string;
        placeOfMarriage: string;
        education: string;
        occupation: string;
        isAlive: boolean;
        dateOfPassing?: string;
    };
    children: {
        name: string;
        relationship: string;
        dateOfBirth: string;
        placeOfBirth: string;
        education: string;
        occupation: string;
        isAlive: boolean;
        dateOfPassing?: string;
    }[];
    friends: {
        name: string;
        relationship: string;
        dateOfBirth: string;
        education: string;
        occupation: string;
        isAlive: boolean;
        dateOfPassing?: string;
    }[];
    currentResidence: {
        currentLocation: string;
        moveInDate: string;
        arrangement: string;
    };
    medicalHistory: {
        medicalProblems: string;
        disabilities: string;
        diagnosisDate: string;
        currentMedications: string;
    }[];
}

export default function PersonaSelection(): JSX.Element {
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
    const { personas } = personasData;

    return (
        <div className="min-h-screen bg-gray-900 text-white py-20 px-8 text-center">
            <h2 className="text-5xl font-extrabold">Choose a Persona for the Demo</h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {personas.map((persona, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="overflow-hidden rounded-xl shadow-lg bg-gray-800"
                    >
                        <img
                            src={`https://source.unsplash.com/400x300/?elderly,portrait&sig=${index}`}
                            alt="Persona Image"
                            className="w-full h-56 object-cover"
                        />
                        <Card className="p-6">
                            <h3 className="text-2xl font-semibold">
                                {persona.personalInfo.firstName} {persona.personalInfo.lastName}
                            </h3>
                            <p className="text-gray-400 mt-2">{persona.education[0]?.fieldOfStudy}</p>
                            <Button
                                className="mt-4 bg-white text-gray-900 hover:bg-gray-300"
                                onClick={() => setSelectedPersona(persona)}
                            >
                                Use this Persona for Demo
                            </Button>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Persona Details Modal */}
            {selectedPersona && (
                <Dialog open={!!selectedPersona} onOpenChange={() => setSelectedPersona(null)}>
                    <DialogContent className="bg-gray-800 text-white max-w-2xl mx-auto p-8 rounded-lg">
                        <DialogTitle className="text-3xl font-bold mb-4">{selectedPersona.personalInfo.firstName} {selectedPersona.personalInfo.lastName}</DialogTitle>
                        <img
                            src={`https://source.unsplash.com/600x400/?elderly,portrait&sig=${selectedPersona.personalInfo.username}`}
                            alt="Persona Image"
                            className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                        <div className="text-gray-300 text-left space-y-3">
                            <p><strong>Age:</strong> {selectedPersona.personalInfo.age}</p>
                            <p><strong>Gender:</strong> {selectedPersona.personalInfo.gender}</p>
                            <p><strong>Place of Birth:</strong> {selectedPersona.personalInfo.placeOfBirth}</p>
                            <p><strong>Education:</strong> {selectedPersona.education.map(edu => `${edu.degree} in ${edu.fieldOfStudy}`).join(", ")}</p>
                            <p><strong>Marital Status:</strong> {selectedPersona.maritalStatus}</p>
                            {selectedPersona.spouse && (
                                <p><strong>Spouse:</strong> {selectedPersona.spouse.name} ({selectedPersona.spouse.occupation})</p>
                            )}
                            <p><strong>Children:</strong> {selectedPersona.children.map(child => child.name).join(", ")}</p>
                            <p><strong>Friends:</strong> {selectedPersona.friends.map(friend => friend.name).join(", ")}</p>
                            <p><strong>Current Residence:</strong> {selectedPersona.currentResidence.currentLocation} ({selectedPersona.currentResidence.arrangement})</p>
                            <p><strong>Medical Conditions:</strong> {selectedPersona.medicalHistory.map(med => med.medicalProblems).join(", ")}</p>
                        </div>
                        <DialogClose asChild>
                            <Link to="/ai">
                                <Button className="mt-6 w-full bg-red-600 hover:bg-red-700">Use</Button>
                            </Link>
                        </DialogClose>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}