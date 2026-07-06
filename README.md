# ChatSphere — Real-Time Chat Application

A full-stack real-time chat app built with the **MERN stack** + **Socket.io**.

## Features

- 🔐 **JWT Authentication** — secure register/login with HTTP-only cookies + bcrypt password hashing
- ⚡ **Real-Time Messaging** — instant delivery via Socket.io (no refresh needed)
- 🟢 **Online / Offline Status** — live presence indicators with "last seen" timestamps
- ⌨️ **Typing Indicator** — see when the other person is typing, in real time
- 🖼️ **Rich Media Sharing** — images, GIFs, videos, voice notes (recorded in-browser), documents (PDF/Word/Excel/PPT/ZIP), and bundled stickers — with multi-file selection and per-category size limits so storage never balloons
- 📥 **Downloadable Media** — every image, video, voice note, and document has a one-click download button (in-chat and in the full-screen viewer)
- 🔍 **Media Lightbox** — click any image/video to open a proper full-screen viewer with a close button, click-outside-to-close, download button, and Esc key support
- 🗑️ **Delete Messages** — deleting a message also deletes its file from disk in real time (via Socket.io) for both users, so storage is actually reclaimed, not just hidden
- ✅ **Read Receipts** — WhatsApp-style sent / delivered / seen ticks per message
- 🔔 **Unread Message Badges** — per-contact unread counters in the sidebar, updated live via sockets
- 🤖 **AI-Powered Features (Gemini)** — voice notes get an automatic speech-to-text transcript, and any text message can be translated on demand (Hindi/English/Spanish/French) with one click
- 📊 **Chat Analytics Dashboard** — per-user stats: total messages sent/received, images shared, top contacts, and hourly activity chart
- 🔎 Search contacts and search messages within a conversation
- 📱 Fully responsive — works cleanly on mobile, tablet, and desktop

## Storage Limits (matched to Cloudinary's own free-plan hard caps)

| Media type | Max size | Notes |
|---|---|---|
| Image | 8 MB | Cloudinary free plan caps images at 10MB — kept a safety margin |
| GIF | 8 MB | Same cap as images (Cloudinary stores GIFs as "image" resource type) |
| Video | 100 MB | Matches Cloudinary free plan's own ceiling exactly |
| Voice note (audio) | 25 MB | Generous for voice notes; Cloudinary allows up to 100MB here |
| Document / file (PDF, Word, Excel, PPT, ZIP, TXT, CSV) | 10 MB | Cloudinary's free-plan "raw file" hard cap — can't be raised without a paid plan |
| Sticker | — | Bundled static asset, never uploaded, zero storage cost |

You can select **multiple images or videos at once** (multi-select in the file picker) — each is sent as its own message automatically. Every image, video, voice note, and document has a **download button** so the file can be saved locally instead of just viewed in-chat.

Deleting a message removes both the MongoDB document and the underlying file on Cloudinary (except stickers, which aren't uploads to begin with) — so storage usage actually goes down, not just the message disappearing from the UI.

## Cloudinary Setup (required — media is stored here, not on disk)

Media files (images, GIFs, videos, voice notes) are uploaded straight to Cloudinary instead of the server's disk. This means they **survive Render restarts, redeploys, and free-tier sleep cycles** — nothing gets wiped.

1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a **free account** (no credit card required — the free plan is permanent, not a trial: 25GB storage + 25GB bandwidth/month)
2. After signing in, your **Dashboard** shows three values you need:
   - `Cloud Name`
   - `API Key`
   - `API Secret` (click "reveal" to see it)
3. Copy these into your backend `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. That's it — no further setup needed. Uploaded files will appear in your Cloudinary Media Library under a `chatsphere` folder.

## Gemini AI Setup (required for transcription + translation)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in with a Google account
2. Click **"Create API Key"** — no credit card needed, the free tier doesn't expire
3. Copy the key into your backend `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. That's it — voice notes will auto-transcribe on send, and the "Translate" link under any text message will work.

**Free tier limits** (as of mid-2026, subject to change — check [ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits) for current numbers): roughly 15 requests/minute and 1,500 requests/day on the Flash model used here. For a portfolio-scale project this is far more than you'll ever hit. Transcription runs in the background *after* the voice note has already sent — so a failed or slow Gemini call never delays or blocks sending a message, and the transcript simply pops in a moment later via Socket.io once it's ready.

⚠️ Do **not** enable billing on the Google Cloud project tied to this key unless you intend to pay — enabling billing removes the free tier entirely for that project, and every call becomes billable from the first token.

## Tech Stack

**Frontend:** React 18 (Vite), Tailwind CSS, Socket.io-client, React Router, Recharts, Axios, React Hot Toast, Lucide icons

**Backend:** Node.js, Express, MongoDB + Mongoose, Socket.io, JWT, bcryptjs, Multer, Cloudinary, Google Gemini API

## Project Structure

```
chat-app/
├── backend/
│   ├── config/db.js, cloudinary.js
│   ├── controllers/       # auth, user, message logic
│   ├── middleware/         # JWT auth guard, image upload
│   ├── models/              # User, Message schemas
│   ├── routes/
│   ├── services/geminiService.js  # Gemini AI: transcription + translation
│   ├── socket/socket.js    # Socket.io connection + events
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/     # Sidebar, ChatWindow, MessageBubble, MessageInput, StatsModal, TypingIndicator
    │   ├── context/          # AuthContext, SocketContext
    │   ├── pages/             # Login, Register, Chat
    │   └── utils/axios.js
    └── vite.config.js
```

## Setup Instructions

### 1. Prerequisites
- Node.js v18+
- MongoDB running locally, or a free MongoDB Atlas cluster

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env` and set your own values:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chatapp
JWT_SECRET=some_long_random_string_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
Then run:
```bash
npm run dev
```
Backend will start on `http://localhost:5000`

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`

### 4. Try it out
- Open two different browsers (or one normal + one incognito window)
- Register two different accounts
- Start chatting — you'll see real-time messages, typing indicators, and online status update instantly

## Deployment Notes

- **Backend**: Deploy on Render/Railway. Set the same environment variables from `.env.example` in your host's dashboard, including the three `CLOUDINARY_*` values. Use a MongoDB Atlas connection string for `MONGO_URI` (free tier works fine).
- **Frontend**: Deploy on Netlify/Vercel. Update the `SOCKET_URL` logic in `src/context/SocketContext.jsx` and the Vite proxy in `vite.config.js` to point to your deployed backend URL, or set an environment variable for the API base URL.
- Media is stored on Cloudinary, not the server's disk, so Render's free-tier restarts/sleep cycles won't delete any images, videos, or voice notes. Note that Render's free tier spins the server down after 15 minutes of inactivity — the first request after that has a 30-50 second "cold start" delay, which is a platform limitation, not something the app itself can fix. Text messages use an optimistic UI update (they appear instantly in your own chat window while the server confirms in the background), so typing/sending always feels instant regardless of that cold start; media uploads still wait for the real upload to finish since there's nothing meaningful to fake there.

## Resume Bullet Points (suggested)

- Built a full-stack real-time chat application using the MERN stack and Socket.io, supporting JWT-authenticated sessions, live typing indicators, and online/offline presence tracking.
- Implemented rich media messaging (images, GIFs, videos, in-browser voice recording, documents, and stickers) with multi-file selection, per-category size limits, and Cloudinary-backed cloud storage so uploads persist across deployments.
- Built a full-screen media lightbox viewer with one-click downloads, WhatsApp-style read receipts (sent/delivered/seen), and live unread-message badges powered by Socket.io.
- Implemented real-time delete-and-cleanup: deleting a message removes the file from Cloudinary storage instantly for both users via Socket.io, keeping storage usage predictable.
- Integrated Google's Gemini API for two AI-powered features: automatic speech-to-text transcription of voice notes, and on-demand multi-language message translation — both designed as non-blocking calls so a failed AI request never prevents a message from sending.
- Designed a chat analytics dashboard using MongoDB aggregation pipelines and Recharts to visualize message volume, top contacts, and hourly activity trends.
- Built a fully responsive UI with Tailwind CSS, with real-time state synchronization across Socket.io events and REST APIs.

---
Built for AccioJob / CETPA mentor-based internship project.
