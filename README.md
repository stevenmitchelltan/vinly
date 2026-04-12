# Vinly

Wine recommendations from Dutch supermarkets, extracted from TikTok wine influencers using AI.

**Live site:** [stevenmitchelltan.github.io/vinly](https://stevenmitchelltan.github.io/vinly/)

## How it works

1. Run the backend locally via Docker
2. Open the admin panel, paste a TikTok URL
3. The backend downloads the video, transcribes the audio (Whisper), extracts wine data (GPT-4o-mini), uploads images to Cloudinary, and saves to MongoDB
4. Run `scripts/deploy.ps1` to export wines to a static JSON file, build the frontend, and push to GitHub Pages

## Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) (for frontend dev)
- [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — add your OPENAI_API_KEY and CLOUDINARY credentials
```

### 2. Start the backend

```bash
docker-compose up --build
```

This starts MongoDB and the FastAPI backend.

### 3. Start the frontend (dev)

```bash
cd frontend
npm install
npm run dev
```

### Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Admin panel | http://localhost:5173/admin |
| Backend API | http://localhost:8000/docs |

## Adding wines

Open the admin panel at `localhost:5173/admin`, paste a TikTok URL, and the pipeline runs automatically.

## Deploying

```powershell
.\scripts\deploy.ps1
```

This exports MongoDB to `docs/wines.json`, builds the frontend into `docs/`, and pushes to GitHub. GitHub Pages serves the `docs/` folder.

## Project structure

```
vinly/
├── backend/             # FastAPI app (runs in Docker)
│   ├── app/             # API routes, services, scrapers
│   ├── config/          # YAML configs (supermarkets, keywords, lexicon)
│   └── scripts/         # CLI utilities and dev tools
├── frontend/            # React 18 + Vite + Tailwind
│   ├── src/components/  # WineCard, WineDetailModal, ImageCarousel, etc.
│   ├── src/pages/       # Home, Admin, About
│   └── src/services/    # API client
├── docs/                # Vite build output (served by GitHub Pages)
├── scripts/deploy.ps1   # One-command deploy
└── docker-compose.yml   # MongoDB + backend
```

## Tech stack

**Backend:** FastAPI, MongoDB (Motor), OpenAI Whisper + GPT-4o-mini, yt-dlp, Cloudinary, Docker

**Frontend:** React 18, Vite, TailwindCSS, Embla Carousel

## License

MIT
