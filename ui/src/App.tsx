import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import PersonaSelection from "./pages/ProfileSelectionPage";
import "./App.css";
import VoiceAssistant from "@/pages/VoiceAssistantPage.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/profile" element={<PersonaSelection/>} />
                <Route path="/ai" element={<VoiceAssistant/>}/>
            </Routes>
        </Router>
    );
}

export default App;