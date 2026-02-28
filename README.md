# MusicGlance

**MusicGlance** is a modern, beautiful, and user-friendly music discovery + download web application built with **Next.js**, **Tailwind CSS**, and **Three.js** for immersive visual effects.  
It allows users to:

- Search and browse YouTube music videos / shorts
- Add URLs to download queue
- Download audio (mp3) in background
- Organize downloaded tracks into custom playlists
- Like songs & manage favorites
- Enjoy interactive UI with firefly effects, golden tearing animation, and a fun unbeatable Tic-Tac-Toe game

## ✨ Features

- 🎵 YouTube-powered music search (videos & shorts) with real-time fallback API keys
- ⬇️ Background audio download via custom API route
- 📚 Library view of all downloaded tracks
- 🎧 Custom playlists with rename/delete support
- ❤️ Like system with persistent liked songs
- 🔍 Search within downloaded library
- 🎮 Built-in single/multiplayer Tic-Tac-Toe game (unbeatable AI mode)
- ✨ Immersive footer with golden tearing animation + interactive speaker + firefly particle effect
- 🌙 Dark/light theme support
- 📱 Fully responsive design
- ⚡ Real-time cross-tab sync using localStorage events

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (Pages Router), React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + localStorage persistence
- **3D/Visual Effects**: Three.js (fireflies, animations)
- **Audio Download**: Custom Next.js API route
- **YouTube Integration**: YouTube Data API v3 (with quota fallback)
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start (Local Development)

1. Clone the repository

```bash
git clone https://github.com/yourusername/musicglance.git
cd musicglance
```

2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create `.env.local` file in root and add your YouTube API keys:

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_primary_api_key
NEXT_PUBLIC_YOUTUBE_API_KEY_BKP=your_backup_api_key
```

4. Run development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure (Important Folders)

```
musicglance/
├── public/
│   ├── sounds/               → audio files (e.g. mixkithappybells.wav)
│   └── Au*.png               → cover images (Au1.png – Au10.png)
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Footer.tsx
│   │   ├── Fireflies.tsx
│   │   ├── TicTacToe.tsx
│   │   └── Playlist.tsx
│   ├── context/
│   │   └── AudioContext.tsx
│   ├── pages/
│   │   ├── index.tsx         (Home / Download page)
│   │   ├── discover.tsx
│   │   ├── library.tsx
│   │   ├── playlists/[name].tsx
│   │   └── _app.tsx
│   ├── api/
│   │   └── download.ts       (audio download endpoint)
│   └── styles/
└── .env.local                (API keys – do NOT commit!)
```

## 🎮 Tic-Tac-Toe Game

- Single player mode → unbeatable AI (minimax algorithm)
- Double player mode → two humans play together
- Persistent score tracking
- Beautiful purple gradient UI with glowing "Until then play the game!" heading

To use it anywhere in your app:

```tsx
import TicTacToe from '@/components/TicTacToe';

<TicTacToe showModeSelector={true} />
```

## ✨ Visual Effects

- **Footer fireflies** — animated glowing particles in the golden wavy area
- **Golden tearing animation** — triggered by clicking the 🔊 speaker
- **Pulse glow text** — "Until then play the game!" uses Caveat font + gradient

## 🛠️ Deployment on Vercel (Recommended)

1. Push your code to GitHub / GitLab / Bitbucket
2. Go to https://vercel.com → New Project → Import Git Repository
3. Select your repo
4. Add Environment Variables:
   - `NEXT_PUBLIC_YOUTUBE_API_KEY`
   - `NEXT_PUBLIC_YOUTUBE_API_KEY_BKP` (optional fallback)
5. Click **Deploy**

Vercel auto-detects Next.js and deploys in ~60 seconds.

## 🔧 Environment Variables

```env
# Required – YouTube Data API v3 key
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional – backup key when primary quota is exceeded
NEXT_PUBLIC_YOUTUBE_API_KEY_BKP=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ⚠️ Known Limitations / Notes

- YouTube API has daily quota (~10,000 units/day per key). Use backup key when primary is exhausted.
- Download speed depends on your serverless function timeout (Vercel free tier = 10s)
- Audio covers (`Au1.png` – `Au10.png`) should be placed in `/public/`
- Sound file (`mixkithappybells.wav`) should be in `/public/sounds/`

## 📜

Happy listening & coding!  
✨ MusicGlance – Glance at music, feel the vibe. ✨