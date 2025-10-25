# Vinly Frontend

Modern React frontend for the Wine Discovery app, hosted on GitHub Pages.

## Features

- 🎨 Beautiful, responsive design with TailwindCSS
- 🍷 Filter wines by supermarket and type
- 📱 Mobile-first responsive layout
- ⚡ Fast performance with Vite
- 🎯 Simple, intuitive user experience

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `VITE_API_BASE_URL` to point to your backend:
- Development: `http://localhost:8000`
- Production: Your Railway backend URL

### 3. Update GitHub Pages Config

In `vite.config.js`, change the `base` to match your repository name:

```javascript
base: '/your-repo-name/'
```

Also update in `src/main.jsx`:

```javascript
<BrowserRouter basename="/your-repo-name">
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Build & Deploy

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install -D gh-pages
```

2. Deploy:
```bash
npm run deploy
```

3. Configure GitHub Pages:
   - Go to your repository settings
   - Navigate to Pages
   - Select `gh-pages` branch as source
   - Save

Your app will be live at: `https://yourusername.github.io/vinly/`

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── SupermarketSelector.jsx
│   │   ├── WineTypeFilter.jsx
│   │   ├── WineCard.jsx
│   │   └── WineGrid.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   └── About.jsx
│   ├── services/       # API integration
│   │   └── api.js
│   ├── App.jsx         # Root component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Customization

### Colors

Wine-themed colors are defined in `tailwind.config.js`:
- `burgundy`: Main wine red color
- `wine`: Pink/rose variations

### Components

All components are in `src/components/`. Key components:
- **SupermarketSelector**: Supermarket filter buttons
- **WineTypeFilter**: Wine type filter (red/white/rose/sparkling)
- **WineCard**: Individual wine display card
- **WineGrid**: Grid layout for wine cards

### API Integration

API calls are centralized in `src/services/api.js`. Update the base URL for different environments.

## Technologies

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client

## Performance

- Lazy loading for images
- Optimized build with Vite
- Minimal bundle size
- Fast page loads

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

MIT

