# SoulSync: Transition from Version 1 (V1) to Version 2 (V2)

## Introduction
This document details the evolution of the Personalized AI Companion for Elderly Patients with Memory Loss project, from Version 1 (V1) to Version 2 (V2). The key objective of this project is to build an AI-powered assistant to help elderly individuals, particularly those with memory loss or Alzheimer's, by utilizing personalized stories, memory recall, and real-time interaction features.

### Version 1 (V1) Approach
In Version 1, the project was hardware-oriented, focused on maximizing privacy by keeping data processing and model running on the user's local machine. This version had a set of features that were constrained by hardware capabilities, requiring significant resources like 24 GB of RAM to operate effectively.

#### Key Features of Version 1:
- **Hardware-Oriented Architecture:** Built using Tauri with local processing, requiring a minimum of 24GB RAM to run the models and handle operations like emotion detection and story generation.
- **Emotion Detection:** Utilized a TensorFlow finetuned model for emotion detection, which was slow and not very accurate.
- **Story Generation:** Stories were generated using a small dataset, limiting the quality and contextual relevance of the output.
- **Facial Recognition & Eye Tracking:** Used for personalization but added significant load to the system.
- **Text-to-Speech (TTS):** Relied on F5 TTS for custom voice generation, which required high RAM and GPU usage.
- **Performance Limitations:** Due to heavy reliance on hardware resources, the system was slow, and the demo experience was hindered by these limitations.

#### Issues Faced in Version 1:
1. **Hardware Dependency:** Required high computational resources, making it less accessible to users with lower-end systems.
2. **Slow Performance:** Due to the reliance on large models for emotion detection, story generation, and TTS, the system became slow and inefficient.
3. **Limited Storytelling:** The story generation quality was subpar, and it did not maintain context well in conversations.
4. **Lack of NLP Integration:** Diary entries and stories generated were not properly annotated or enhanced with NLP techniques, leading to a lack of meaningful interactions.

### Version 2 (V2) Approach
In Version 2, we moved toward a cloud-based solution with a microservice architecture, leveraging Lambda functions for backend services to improve scalability, reduce dependency on local hardware, and ensure better performance.

#### Key Changes in Version 2:
- **Cloud-Based Architecture:** Transitioned to using a microservice architecture with Lambda functions for scalable backend services, allowing the system to run on any machine with minimal local hardware dependency.
- **Diary Annotation Submodule:** Developed a new NLP module that processes diary entries using advanced NLP techniques like entity extraction, relationship resolution, coreference, and AI-based refinement.
- **Improved Storytelling:** Finetuned the Mistral-7B model using a larger dataset of 1002 short stories, leading to better and faster story generation.
- **Removal of Emotion Detection & Facial Recognition:** Due to high cloud costs, we removed the emotion detection and facial recognition modules, focusing on other optimizations.
- **Custom Voice Cloning with OpenVoice:** Replaced the high-resource F5 TTS model with OpenVoice, an open-source voice cloning system that works with less CPU and memory usage.
- **Public Demo Testing UI:** Introduced a demo testing UI, enabling users to test the system features easily.

#### Reasons for Moving to Version 2:
1. **Scalability and Performance:** Cloud services enable more efficient processing, as Lambda functions allow horizontal scaling, which solves the hardware performance issues from Version 1.
2. **Cost Optimization:** By removing resource-heavy modules (e.g., emotion detection and facial recognition) and optimizing TTS, cloud costs were reduced.
3. **Better User Experience:** The transition to cloud-based architecture ensures a faster and more responsive system, making the experience smoother for users.
4. **Improved Story Generation:** By using a larger, cleaner dataset and finetuning the Mistral-7B model, story generation quality and speed have improved significantly.
5. **NLP Integration for Diary Annotation:** The addition of NLP techniques allows diary entries to be annotated and refined, offering a more personalized and accurate memory recall.

## Feature Comparison: Version 1 vs Version 2

| **Feature**                                | **Version 1 (V1)**                                                                                                                                                             | **Version 2 (V2)**                                                                                                                                                                    |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Platform**                               | Hardware-oriented, built with Tauri                                                                                                                                              | Cloud-based, using microservices and Lambda functions for scalability                                                                                                                 |
| **Performance**                            | Dependent on hardware; required a minimum of 24GB RAM for running LLMs and models (emotion detection, story generation, etc.)                                                  | Optimized performance with Lambda functions and reduced hardware dependency                                                                                                           |
| **Emotion Detection**                      | Used a finetuned TensorFlow model for emotion detection, which was inaccurate and slow                                                                                           | Removed emotion detection to reduce cloud costs; focused on improved NLP and story generation                                                                                           |
| **Story Generation**                       | Used a small dataset for finetuned Gemini API; stories were not contextually proper and lacked narrative quality                                                                 | Stories generated using finetuned Mistral-7B on a large dataset of 1002 short stories, improving quality and speed of generation                                                       |
| **Modules**                                | Emotion detection, transcription, text-to-speech (TTS), speech-to-text were slower and less accurate                                                                            | Improved NLP modules for diary annotation, faster and more accurate TTS using OpenVoice for voice cloning with reduced resource usage                                                 |
| **Emotion Detection Model**                | TensorFlow finetuned model with poor accuracy                                                                                                                                    | Emotion detection module removed for cost efficiency                                                                                                                                    |
| **Story Context**                          | Stories generated did not stay consistent with the context of the chat, lacked proper continuity                                                                               | Stories stay relevant to the conversation and context, improved by contextual AI that maps memories to conversation context and user profiles                                           |
| **Diary Entry Annotation**                 | No NLP techniques for annotating diary entries                                                                                                                                   | Integrated NLP techniques to annotate diary entries, improving data organization and retrieval                                                                                         |
| **AI Voice Customization**                 | No voice customization                                                                                                                                                          | Developed a custom voice training model that personalizes the AI’s voice from just 15 seconds of audio                                                                                  |
| **Facial Recognition & Eye Tracking**      | No facial recognition or eye tracking                                                                                                                                           | Removed facial recognition and eye tracking modules to reduce cloud costs                                                                                                             |
| **Deployment**                             | Limited to hardware deployment                                                                                                                                                  | Software deployment on multiple platforms with enhanced privacy and control                                                                                                            |
| **User Experience**                        | Demo and basic testing were limited by hardware requirements                                                                                                                   | Improved real-world usability with better testing and personalization features                                                                                                         |
| **Data Processing**                        | Data processing was dependent on local hardware, which slowed down performance                                                                                                  | More efficient data processing through optimized code and integration of Python sidecar processes                                                                                       |
| **Memory Recall and Analytics**            | Lacked memory recall and trend analysis                                                                                                                                         | Memory recall with an evaluation algorithm to track trends and provide analytics                                                                                                      |
| **Privacy & Control**                      | Relied on hardware, which limited privacy and control                                                                                                                           | Greater privacy and control through cross-platform software deployment                                                                                                               |

## Conclusion
The transition from Version 1 to Version 2 was driven by the need for scalability, improved performance, and reduced hardware dependency. The move to a cloud-based solution with microservices, along with the introduction of advanced NLP techniques and improved models, has resulted in a significantly enhanced user experience, better story generation, and lower operational costs.

By adopting a modular approach with lambda functions and optimized voice processing, we were able to make the system more accessible, efficient, and cost-effective, while still maintaining the privacy and control of user data. Version 2 sets the foundation for further improvements and opens the door for future expansions, including new AI-powered features and more personalized interactions.
