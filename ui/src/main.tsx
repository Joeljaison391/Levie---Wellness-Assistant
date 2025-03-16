import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {ProfileProvider} from "@/context/ProfileContext.tsx";
import {VoiceAssistantProvider} from "@/context/VoiceAssistantContext.tsx";
import {MemoryProvider} from "@/context/MemoryContext.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ProfileProvider>
          <VoiceAssistantProvider>
              <MemoryProvider>              <App /></MemoryProvider>

          </VoiceAssistantProvider>

      </ProfileProvider>

  </StrictMode>,
)
