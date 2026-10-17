# 🚀 ProposalPilot — AI Proposal Generator for Freelancers

> **Your side hustle wingman.** Generate winning freelance proposals in seconds using open-source AI. Privacy-first, $0 running cost, 100% local.

![ProposalPilot](https://img.shields.io/badge/AI-Gemma%20(Open--Weight)-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2026-orange?style=for-the-badge)

---

## 🎯 What It Does & Who Would Pay For It

ProposalPilot is an AI-powered proposal generator built specifically for freelancers on platforms like **Upwork**, **Fiverr**, **Toptal**, and direct client outreach.

**The problem:** Freelancers spend 30-60 minutes writing each proposal. With a typical 5-15% win rate, that's hours of unpaid work every week. Most proposals sound generic because after the 10th one today, you're out of creative energy.

**The solution:** Paste a job description → get a personalized, platform-optimized proposal in under 60 seconds. Your client data never leaves your machine, and it costs $0 to run.

**Who would pay:** Any freelancer bidding on projects. At $9/mo for the hosted version (vs. $0 self-hosted), it pays for itself if it wins you just one extra gig per year.

## 🎬 Demo

**Live Demo:** [proposalpilot.tech](https://proposalpilot.tech) *(coming soon)*

### How It Works

1. **Paste** the client's job posting
2. **Configure** your expertise, rate, tone, and platform
3. **Generate** a personalized proposal with AI
4. **Copy & Send** — or tweak it and regenerate

## 💻 Code

Built with a lean, modern stack:

```
├── index.html          # Landing page + generator UI
├── styles/main.css     # Design system (dark theme, glassmorphism)
├── scripts/main.js     # Frontend logic + local fallback generation
├── server/index.js     # Express API with Gemma integration
├── vite.config.js      # Dev server with API proxy
└── package.json
```

## 🛠 How I Built It

### Open-Source AI Stack

- **[Gemma](https://ai.google.dev/gemma)** — Google's open-weight model (`gemma-3-27b-it`). This is the brain of ProposalPilot. It understands job descriptions, detects project types, extracts requirements, and generates natural-sounding proposals tailored to each platform's style.

- **Local-first architecture** — The frontend includes a complete local proposal generation engine that works without any API calls. It uses keyword extraction, project type detection, budget/timeline parsing, and template-based generation. When Gemma is available via API, it produces even better results.

- **[@google/genai](https://www.npmjs.com/package/@google/genai)** — Google's official SDK for accessing Gemma through their API. Free tier available.

### Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | Vanilla JS + Vite | Fast, no framework bloat, instant HMR |
| Styling | Custom CSS | Full control, glassmorphism, micro-animations |
| Backend | Express.js | Lightweight API proxy for Gemma |
| AI Model | Gemma 3 27B IT | Open-weight, free, high quality |
| Fonts | Inter + JetBrains Mono | Premium feel |

### Key Features

- 🎨 **Stunning dark UI** with glassmorphism, animated gradients, and micro-interactions
- 📝 **Smart local generation** that works offline (keyword extraction, project type detection, template system)
- ⚡ **Real-time typing animation** for proposal output
- 📋 **Platform-specific templates** for Upwork, Fiverr, Toptal, and direct outreach
- 🎛️ **Tone control** — professional, friendly, confident, or consultative
- 📊 **Counter animations** and scroll-triggered reveal effects
- 🖱️ **Interactive mouse glow** effects on cards
- ⌨️ **Keyboard shortcut** (Ctrl+Enter to generate)

## 🔓 Why Does Open Innovation Matter?

### Privacy is the Product

Freelancers type client names, project budgets, proprietary requirements, and their own pricing strategy into this tool. Sending that to a closed API means:

- The API provider knows what you charge
- They know who your clients are
- They know what projects you're bidding on
- They can train on your winning proposals

With Gemma running locally, **none of that data leaves your machine**. For freelancers working with healthcare companies, legal firms, or government contractors, this isn't a nice-to-have — it's a requirement.

### The Business Math Works

Closed AI APIs charge per token. A typical proposal generation costs ~$0.01-0.05 per call. At 20 proposals/day, that's $6-30/month just in API fees — before hosting, before profit. For a $9/mo SaaS product, the margin is razor-thin or negative.

With Gemma:
- **$0 per generation** — open-weight, no API fees
- **Self-hostable** — users can run it on their own hardware
- **No vendor lock-in** — if Google changes Gemma's terms, swap to another open model
- **Fine-tunable** — train it on your winning proposals to get even better results

### Open-Weight > Closed API

| Factor | Closed API | Gemma (Open-Weight) |
|--------|-----------|-------------------|
| Cost per call | $0.01-0.10 | $0.00 |
| Data privacy | Sent to third party | Stays on your machine |
| Customization | None | Fine-tune on your data |
| Vendor lock-in | High | Zero |
| Offline capable | No | Yes |
| Margin at $9/mo | Negative | Profitable |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- (Optional) Google AI Studio API key for Gemma

### Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/proposalpilot.git
cd proposalpilot

# Install dependencies
npm install

# Start the dev server (frontend only — local generation works!)
npm run dev

# (Optional) Start the API server for Gemma-powered generation
GEMINI_API_KEY=your_key_here node server/index.js
```

The app works in two modes:
1. **Local mode** (default) — Uses the built-in proposal engine. No API key needed.
2. **AI mode** — When the backend is running with a Gemma API key, proposals are generated by Gemma 3 27B IT for higher quality.

### Get a Free API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Set it as `GEMINI_API_KEY` environment variable

## 📄 License

MIT — Use it, fork it, sell it, do whatever you want.

---

*Built for [Hacktoberfest 2026](https://hacktoberfest.com) — Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle*
