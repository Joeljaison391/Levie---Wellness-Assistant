import React, { useEffect, useState } from "react";
import { useMemory, Memory } from "@/context/MemoryContext";

// ShadCN UI components (adjust import paths based on your project setup)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

// Framer Motion for animations
import { motion, AnimatePresence } from "framer-motion";

const StoriesDashboardPage: React.FC = () => {
    // Extract context values
    const { stories, loading, annotateDiaryEntry, getAllStories } = useMemory();

    // Local state for modals and selected story
    const [isAddModalOpen, setAddModalOpen] = useState<boolean>(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState<boolean>(false);
    const [selectedStory, setSelectedStory] = useState<Memory | null>(null);

    // Form state for adding a new story
    const [diaryEntry, setDiaryEntry] = useState<string>("");
    const [personalId, setPersonalId] = useState<string>("");

    // Fetch all stories on component mount using context's getAllStories
    useEffect(() => {
        getAllStories().catch((error) =>
            console.error("Error fetching stories on mount:", error)
        );
    }, [getAllStories]);

    // Handler for submitting a new story (calls the annotate endpoint)
    const handleAddStory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await annotateDiaryEntry(diaryEntry, personalId);
            // Re-fetch the stories to include the new story
            await getAllStories();
            // Clear form and close modal
            setDiaryEntry("");
            setPersonalId("");
            setAddModalOpen(false);
        } catch (error) {
            console.error("Error adding story:", error);
        }
    };

    // Open detail modal for a specific story
    const openDetailModal = (story: Memory) => {
        setSelectedStory(story);
        setDetailModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white text-black p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Diary Stories</h1>
                <Button onClick={() => setAddModalOpen(true)} className="mb-6">
                    Add New Story
                </Button>
                {loading ? (
                    <p className="text-gray-700">Loading stories...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence>
                            {stories.map((story, index) => (
                                <motion.div
                                    key={story.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Card className="bg-white border border-gray-300 p-4 shadow-sm">
                                        <h2 className="text-xl font-semibold mb-2 text-gray-900">
                                            Story #{story.id}
                                        </h2>
                                        <p className="text-gray-700 line-clamp-3">{story.diary_text}</p>
                                        <Button
                                            onClick={() => openDetailModal(story)}
                                            variant="outline"
                                            className="mt-4"
                                        >
                                            View Details
                                        </Button>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Add New Story Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent className="bg-gray-50 text-gray-900 p-6 rounded-md max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Story</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddStory} className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-800">Diary Entry</label>
                            <textarea
                                className="mt-1 w-full rounded bg-white border border-gray-300 p-2 text-gray-900"
                                value={diaryEntry}
                                onChange={(e) => setDiaryEntry(e.target.value)}
                                required
                                rows={4}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-800">Personal ID</label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded bg-white border border-gray-300 p-2 text-gray-900"
                                value={personalId}
                                onChange={(e) => setPersonalId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Submit</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Story Details Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setDetailModalOpen}>
                <DialogContent className="bg-gray-50 text-gray-900 p-6 rounded-md max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Story Details</DialogTitle>
                    </DialogHeader>
                    {selectedStory && (
                        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Diary Text</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {selectedStory.diary_text}
                                </p>
                            </div>
                            {selectedStory.annotated_story && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Annotated Story</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {selectedStory.annotated_story}
                                    </p>
                                </div>
                            )}
                            {selectedStory.annotations && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Annotations</h3>
                                    <pre className="bg-white border border-gray-200 p-2 rounded overflow-auto text-sm text-gray-800">
                    {JSON.stringify(selectedStory.annotations, null, 2)}
                  </pre>
                                </div>
                            )}
                            {selectedStory.ai_enhanced_annotations && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">AI Enhanced Annotations</h3>
                                    <pre className="bg-white border border-gray-200 p-2 rounded overflow-auto text-sm text-gray-800">
                    {JSON.stringify(selectedStory.ai_enhanced_annotations, null, 2)}
                  </pre>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="mt-4 flex justify-end">
                        <Button onClick={() => setDetailModalOpen(false)} variant="outline">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StoriesDashboardPage;
