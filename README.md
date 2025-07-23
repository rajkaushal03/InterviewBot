# InterviewBot

InterviewBot is a modern AI-powered chatbot application built with Next.js and TypeScript. It simulates an interview with "Swayam Kaushal," a fresher skilled in full-stack development and AI. The app features a rich UI, voice input/output, customizable AI response tones, and is designed for both technical demonstration and interactive user experience.

## Features
- Chat with an AI simulating a real interviewee
- Voice input (speech recognition) and output (text-to-speech)
- Selectable response tones (professional, casual, etc.)
- Modern, responsive UI with custom components
- Toast notifications and loading indicators
- Local development with Firebase emulators (Auth, Firestore)

## Tech Stack
- **Frontend:** Next.js (React, TypeScript)
- **Styling:** Tailwind CSS, PostCSS
- **AI/Backend:** Custom TypeScript flows, Genkit, Google AI
- **Voice:** Web Speech API (SpeechRecognition, SpeechSynthesis)
- **UI Library:** Custom components, Radix UI
- **State Management:** React hooks
- **Firebase:** Emulators for Auth and Firestore (local dev)
- **Dev Environment:** Nix, Node.js, Java (for Firebase)

## Getting Started

### Prerequisites
- Node.js (v20 recommended)
- npm
- (Optional) Nix for reproducible dev environments

### Installation
```bash
npm install
```

### Running the App
```bash
npm run dev
```
The app will start on [http://localhost:9002](http://localhost:9002) by default.

### Firebase Emulators (Optional)
- Ensure `firebase.json` is present in the root directory.
- Auth and Firestore emulators will start automatically if configured.

## Scripts
- `npm run dev` — Start Next.js dev server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Lint code
- `npm run typecheck` — TypeScript checks
- `npm run genkit:dev` — Start Genkit AI flows
- `npm run genkit:watch` — Start Genkit AI flows in watch mode

## Project Structure
See [`project overview.md`](./project%20overview.md) for a detailed breakdown of the architecture, workflow, and all major files and directories.

## License
MIT (or specify your license here)

---

For a deep dive into the architecture, AI flows, and UI components, please refer to [`project overview.md`](./project%20overview.md).
