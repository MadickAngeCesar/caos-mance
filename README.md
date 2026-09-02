# CAOS - Client Acquisition & Outreach System

CAOS is a high-converting, offline-first Client Acquisition & Outreach Operating System built by MAC TECH. 
It combines a modern CRM pipeline, deep web research tools, and AI-powered outreach drafting using Google's Gemini models.

## 🚀 Key Features

- **Local-First Architecture**: All your pipeline data, contacts, and opportunities are stored securely on your local device.
- **Smart AI Prospecting**: Enter a region and industry, and use Gemini AI to automatically generate tailored leads and prospects.
- **AI Outreach Composer**: Generate hyper-personalized emails, WhatsApp messages, LinkedIn InMails, and formal institutional letters directly from your CRM data.
- **Dynamic Playbooks**: Customizable outreach playbooks and follow-up templates (including advanced technical follow-up templates and business proposal generators).
- **Multi-Platform Desktop App**: Fully configured for Windows, macOS, and Linux as a standalone Electron desktop application.
- **Credit-Optimized AI**: Built-in intelligent model fallback system for Gemini APIs to ensure uptime and performance.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS (v4), Framer Motion, Lucide Icons
- **Backend / Local Server**: Node.js, Express, Vite, esbuild
- **Desktop Wrapper**: Electron.js, electron-builder
- **AI Integrations**: Google GenAI SDK (`@google/genai`)

## 💻 Getting Started (Web Mode)

To run the application locally in standard web browser mode:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The app will be available locally on port 3000.*

3. **Build for Production (Web):**
   ```bash
   npm run build
   npm run start
   ```

## 🖥 Desktop Execution (Electron)

CAOS is designed to be shipped as a standalone desktop application. 

To run the application in its native desktop window, or to compile `.exe` (Windows), `.dmg` (Mac), or `.AppImage` (Linux) installers, please read the included documentation:

👉 **[View the CAOS Desktop Guide](DESKTOP_GUIDE.md)**

## 🔑 Configuration

To unlock AI functionalities (Smart Prospecting, Content Writing, Outreach Generation), you will need a **Google Gemini API Key**.
- Open the CAOS application.
- Navigate to **Settings** (Gear icon on the sidebar).
- Under **AI & Gemini Keys**, securely paste your API key. (The key is stored safely in your local storage).

## 📄 License

Proprietary Software - Copyright © MAC TECH. All rights reserved.
