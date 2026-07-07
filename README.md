# Caply: Stamina & Workload Control

The simplified stamina tracker and prospective contract simulator for freelancers to balance workload, protect energy levels, and make data-driven income decisions.

## Overview

Caply is designed specifically for freelancers who struggle with burnout, overcommitment, and volatile workloads. By tracking current active clients, prospective contract values, and actual logged hours against custom stamina budgets, Caply helps freelancers make sustainable business choices. It visualizes real-time stamina usage and simulates future income scenarios so you can grow your freelance career with complete clarity and confidence.

## Features

- **Dynamic Stamina & Workload Meter**: Instantly visualize your current weekly workload versus your maximum stamina budget to prevent overcommitment.
- **Prospective Contract Simulator**: Input new potential projects, adjust rates, or shift modes to see how they impact your weekly income and stamina *before* signing any contracts.
- **Interactive Work Hour Logger**: Log daily actual hours worked for each client and compare active stamina levels with planned estimates.
- **Client & Roster Management**: Seamlessly add, edit, or delete client profiles, track their value scores, contract terms, and weekly earnings.
- **PWA Ready**: Installable directly onto mobile devices and desktops with a custom high-quality launcher icon, web app manifest, and offline-ready asset caching.

## Demo

- Live app: [Open Caply Live App](https://caply-workload.netlify.app/)
- AI Studio project: [View Project on AI Studio Build](https://ai.studio/build)

## Screenshots

*(Add screenshots of your actual app dashboard, contract simulator, and mobile install prompt here to customize your repository!)*

## Tech Stack

- **Frontend**: React (Vite) / TypeScript
- **Styling & Animations**: Tailwind CSS / Framer Motion
- **Icons**: Lucide React
- **PWA Service**: Web App Manifest / Service Worker cache implementation
- **Hosting**: Netlify / Google Cloud Run

## Local Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone this repository and navigate to the project directory
npm install
```

### Environment Variables

If you are using environment variables, create a `.env` or `.env.local` file and add:

```bash
GEMINI_API_KEY=your_api_key_here
```

### Run Locally

```bash
npm run dev
```

The application will be running at `http://localhost:3000`.

## Deployment

### Netlify Deployment

This repository is optimized to run smoothly on Netlify with fully configured routes:
1. Connect your GitHub repository to your **Netlify** account.
2. The built-in `netlify.toml` file will automatically configure the build command (`npm run build`), publish directory (`dist`), and SPA single-page routing redirects (`/_redirects`).
3. Set any optional environment variables in your Netlify site settings.

## Project Structure

```txt
├── public/                # Static assets, launcher icons, and manifest configuration
│   ├── icon-192.png       # PWA Launcher icon (192x192)
│   ├── icon-512.png       # PWA Launcher icon (512x512)
│   ├── manifest.json      # Web App Manifest for mobile installation
│   └── sw.js              # Service Worker file for caching and PWA support
├── src/                   # React app source code
│   ├── components/        # Extracted components (Modals, Wizards, etc.)
│   │   ├── ClientWizardModal.tsx
│   │   ├── LogWorkWizardModal.tsx
│   │   └── OnboardingWizard.tsx
│   ├── assets/            # App images and design visual resources
│   ├── App.tsx            # Main application dashboard and state management
│   ├── index.css          # Custom Tailwind imports and branding typography
│   ├── main.tsx           # Entry point with PWA Service Worker registration
│   └── types.ts           # Shared TypeScript interfaces and contract models
├── netlify.toml           # Netlify SPA production redirect guidelines
├── package.json           # Project dependencies and script declarations
└── tsconfig.json          # TypeScript compilation instructions
```

## Notes

- **API Security**: Keep any API keys private. Never commit `.env` or `.env.local` files to GitHub.
- **PWA Optimization**: Be sure to test the "Add to Home Screen" feature using a real mobile device or Chrome DevTools mobile emulation.
- **Local Persistence**: All project data is securely persisted on the client's local storage so progress remains intact between browser sessions and device installs.

## License

MIT
