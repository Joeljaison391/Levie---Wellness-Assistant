import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LucideArrowRight } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="relative flex flex-col min-h-screen items-center bg-gray-100 overflow-hidden">
            {/* Hero Section */}
            <div className="relative w-full bg-gray-900 text-white text-center py-20 px-8">
                <motion.h1
                    className="text-6xl font-bold leading-tight max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    A Smarter Way to Preserve Memories
                </motion.h1>
                <motion.p
                    className="mt-6 text-lg max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                >
                    Livie helps seniors cherish their past, prevent memory loss, and stay engaged through personalized storytelling, memory games, and smart reminders.
                </motion.p>
                <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <Button className="px-8 py-4 text-lg font-semibold rounded-full bg-white text-gray-900 hover:bg-gray-200 transition flex items-center gap-2">
                        Try the Demo <LucideArrowRight size={18} />
                    </Button>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="py-20 px-8 max-w-6xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-800">Why People Trust Livie</h2>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard emoji="🧠" title="Memory Preservation" description="Livie crafts personalized stories to keep the mind active." imageUrl="https://source.unsplash.com/random/300x200?memory" />
                    <FeatureCard emoji="📢" title="Custom Voice Narration" description="Listen to stories in a familiar, comforting voice." imageUrl="https://source.unsplash.com/random/300x200?voice" />
                    <FeatureCard emoji="🎮" title="Memory Games" description="Engaging activities designed to strengthen cognitive function." imageUrl="https://source.unsplash.com/random/300x200?games" />
                    <FeatureCard emoji="⏰" title="Smart Reminders" description="Never miss important daily activities or medications." imageUrl="https://source.unsplash.com/random/300x200?reminders" />
                    <FeatureCard emoji="🚨" title="Emergency Response" description="Instant alerts for safety and quick assistance." imageUrl="https://source.unsplash.com/random/300x200?emergency" />
                    <FeatureCard emoji="🔐" title="100% Private & Secure" description="No cloud storage—your data stays in your home." imageUrl="https://source.unsplash.com/random/300x200?security" />
                </div>
            </div>

            {/* Testimonials */}
            <div className="bg-gray-200 py-20 px-8 w-full">
                <h2 className="text-4xl font-bold text-center text-gray-800">What People Say About Livie</h2>
                <div className="mt-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <TestimonialCard name="Emily Thompson" title="Caregiver" feedback="Livie has been a lifesaver for my father. He loves listening to the stories, and his memory retention has improved." />
                    <TestimonialCard name="John Peterson" title="Elderly User" feedback="I enjoy playing the memory games every morning. It keeps my mind active, and I feel more confident." />
                    <TestimonialCard name="Dr. Lisa Wong" title="Neurologist" feedback="Livie is an excellent tool for seniors. It helps with memory retention and improves cognitive engagement." />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ emoji, title, description, imageUrl }: { emoji: string; title: string; description: string; imageUrl: string }) {
    return (
        <motion.div
            className="p-6 bg-white shadow-md rounded-xl text-left flex flex-col space-y-4 border border-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <img src={imageUrl} alt={title} className="w-full h-40 object-cover rounded-md" />
            <div className="text-3xl">{emoji}</div>
            <div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </motion.div>
    );
}

function TestimonialCard({ name, title, feedback }: { name: string; title: string; feedback: string }) {
    return (
        <motion.div
            className="p-6 bg-white shadow-md rounded-xl border border-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <p className="text-gray-700 italic">“{feedback}”</p>
            <div className="mt-4 text-gray-800 font-semibold">{name}</div>
            <div className="text-gray-500 text-sm">{title}</div>
        </motion.div>
    );
}