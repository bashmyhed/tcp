# Terminal Chat App

A modern React chat application with a terminal emulator aesthetic, built with Vite, Tailwind CSS, and Catppuccin color scheme.

## Features

- 🌙 **Dark Catppuccin Theme** - Beautiful pastel colors on dark background
- 💻 **Terminal-style UI** - Monospace font and console-inspired message layout
- 🚀 **Smooth Animations** - Framer Motion powered sidebar and transitions
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔐 **Login Page** - Simple authentication flow
- 💬 **Chat Interface** - Terminal-style message display with timestamps
- 📋 **Chat History** - Sidebar with previous chat sessions
- ⚡ **Hot Reload** - Fast development with Vite

## Quick Start

### Development (Docker)

```bash
# Start the development server
docker compose up -d

# View logs
docker compose logs -f terminal-chat-dev

# Stop the server
docker compose down
```

The app will be available at http://localhost:5173

### Development (Local)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Production (Docker)

```bash
# Build production image
docker build -t terminal-chat-app .

# Run production container
docker run -p 80:80 terminal-chat-app
```

## Project Structure

```
src/
├── components/
│   └── Sidebar.jsx          # Chat history sidebar with animations
├── pages/
│   ├── LoginPage.jsx        # Authentication page
│   └── ChatPage.jsx         # Main chat interface
├── App.jsx                  # Main app with routing
├── main.jsx                 # React entry point
└── index.css               # Tailwind CSS and global styles
```

## Features Overview

### Login Page
- Centered form with Catppuccin styling
- Username and password validation
- Smooth transitions and focus states

### Chat Page
- Terminal-style message display with prefixes ([USER], [ASSISTANT], [SYSTEM])
- Auto-scrolling chat area
- Input with terminal prompt (`>`) 
- Monospace Fira Code font
- Color-coded message types

### Sidebar
- Hamburger menu toggle
- Animated slide-in/out with backdrop
- Chat session history
- Active session highlighting
- Truncated long titles
- New chat button

### Theme
- **Base**: `#1e1e2e` (Catppuccin Base)
- **Surface**: `#313244` (Surface0), `#45475a` (Surface1) 
- **Text**: `#cdd6f4` (Text)
- **Accents**: `#89b4fa` (Blue), `#f38ba8` (Pink), `#a6e3a1` (Green)

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing  
- **Lucide React** - Beautiful icons
- **Docker** - Containerization

## Development

The app includes hot reloading, so any changes to the source code will automatically refresh the browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Customization

### Colors
Modify the Catppuccin color palette in `tailwind.config.js`:

```js
colors: {
  'ctp': {
    base: '#1e1e2e',
    surface0: '#313244',
    // ... add more colors
  }
}
```

### Fonts
The app uses Fira Code by default. Change the font family in `tailwind.config.js` and `index.html`.

### Messages
Customize message styling and prefixes in `ChatPage.jsx`.

## License

MIT
