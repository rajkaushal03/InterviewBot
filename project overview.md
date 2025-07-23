# Project Overview: InterviewBot

## Table of Contents
- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Workflow](#workflow)
- [Directory & File Structure](#directory--file-structure)
- [Key Components](#key-components)
- [AI Flows](#ai-flows)
- [UI Components](#ui-components)
- [Custom Hooks](#custom-hooks)
- [Utilities](#utilities)
- [Styling](#styling)
- [Development Environment](#development-environment)
- [How to Run](#how-to-run)

---

## Introduction
InterviewBot is a Next.js-based AI chatbot application that simulates an interview with "Swayam Kaushal," a fresher skilled in full-stack development and AI. The app features a modern UI, voice input/output, and customizable AI response tones. It is designed for both technical demonstration and interactive user experience.

---

## Tech Stack
- **Frontend:** Next.js (React, TypeScript)
- **Styling:** Tailwind CSS, PostCSS
- **AI/Backend:** Custom TypeScript flows, Genkit, Google AI
- **Voice:** Web Speech API (SpeechRecognition, SpeechSynthesis)
- **UI Library:** Custom components, Radix UI
- **State Management:** React hooks
- **Firebase:** Emulators for Auth and Firestore (local dev)
- **Dev Environment:** Nix, Node.js, Java (for Firebase)

---

## Architecture
- **App Entry:** `src/app/page.tsx` (main chat page)
- **Layout:** `src/app/layout.tsx` (global layout, metadata, Toaster)
- **AI Logic:** `src/ai/flows/` (response generation, tone adjustment)
- **UI Components:** `src/components/ui/` (buttons, sidebar, forms, etc.)
- **Chat Components:** `src/components/chat/` (input, message, loading)
- **Hooks:** `src/hooks/` (custom React hooks)
- **Utilities:** `src/lib/utils.ts` (utility functions)
- **Styling:** `src/app/globals.css`, `tailwind.config.ts`

---

## Workflow
1. **Startup:**
   - Run with `npm run dev` (Next.js dev server, port 9002 by default).
   - Firebase emulators start if `firebase.json` is present (for local Auth/Firestore).
2. **Main App:**
   - User interacts with the chat UI (`src/app/page.tsx`).
   - Messages are managed in React state.
   - User can type or use speech recognition for input.
   - On send, the message is processed by the AI flow (`generateSwayamResponse`).
   - AI response can be adjusted for tone (`adjustVoiceTone`).
   - Responses can be read aloud using browser TTS, with selectable voices and tones.
3. **UI/UX:**
   - Modern, responsive UI with custom components.
   - Toast notifications for feedback.
   - Loading indicators during AI processing.

---

## Directory & File Structure
```
InterviewBot/
  ├── src/
  │   ├── app/
  │   │   ├── page.tsx         # Main chat page
  │   │   ├── layout.tsx       # App layout and metadata
  │   │   ├── globals.css      # Global styles
  │   ├── ai/
  │   │   ├── genkit.ts        # AI setup
  │   │   ├── dev.ts           # AI dev entry
  │   │   └── flows/
  │   │       ├── generate-response.ts     # AI response logic
  │   │       └── adjust-voice-tone.ts     # AI tone adjustment
  │   ├── components/
  │   │   ├── chat/             # Chat UI components
  │   │   └── ui/               # General UI components
  │   ├── hooks/                # Custom React hooks
  │   └── lib/                  # Utility functions
  ├── package.json              # Dependencies and scripts
  ├── tailwind.config.ts        # Tailwind CSS config
  ├── .idx/dev.nix              # Nix dev environment config
  └── README.md                 # Project intro (to be filled)
```

---

## Key Components
### Main Chat Page (`src/app/page.tsx`)
- Implements the chat interface, message state, voice tone selection, speech recognition, and TTS.
- Integrates with AI flows for generating and adjusting responses.

### Layout (`src/app/layout.tsx`)
- Sets up global metadata, fonts, and includes the Toaster for notifications.

---

## AI Flows
### `generate-response.ts`
- Defines the main AI response logic.
- Uses Genkit and Google AI to simulate Swayam Kaushal's interview answers.
- Accepts prompt and voice tone as input.

### `adjust-voice-tone.ts`
- Adjusts the tone of AI responses (e.g., professional, casual, enthusiastic).
- Ensures responses match the selected tone.

---

## UI Components
### Chat Components (`src/components/chat/`)
- **ChatInput.tsx:** Input box with support for text and voice.
- **ChatMessage.tsx:** Displays chat messages with sender and timestamp.
- **LoadingIndicator.tsx:** Shows when the AI is generating a response.

### General UI (`src/components/ui/`)
- **Sidebar, Button, Form, Table, etc.:** Modern, reusable components built on Radix UI and Tailwind CSS.
- **Toaster/Toast:** For notifications.

---

## Custom Hooks
- **use-toast.ts:** Custom toast notification system.
- **use-mobile.tsx:** Detects if the user is on a mobile device for responsive UI.

---

## Utilities
- **utils.ts:** Utility function `cn` for merging Tailwind and classnames.

---

## Styling
- **globals.css:** Global styles, color themes, and dark mode support.
- **Tailwind CSS:** Utility-first styling for all components.

---

## Development Environment
- **Nix (`.idx/dev.nix`):** Ensures reproducible dev environment with Node.js, Java, Firebase emulators, and workspace previews.
- **Scripts:**
  - `npm run dev`: Start Next.js dev server
  - `npm run build`: Build for production
  - `npm run start`: Start production server
  - `npm run lint`: Lint code
  - `npm run typecheck`: TypeScript checks
  - `genkit:dev`, `genkit:watch`: Start Genkit AI flows

---

## How to Run
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **(Optional) Start Firebase emulators:**
   - Ensure `firebase.json` is present.
   - Emulators for Auth and Firestore will start automatically if configured.

---

## Summary
InterviewBot is a modern, full-stack AI chatbot app with a focus on interview simulation, voice features, and a rich, customizable UI. It is built for extensibility, developer experience, and interactive user engagement. 