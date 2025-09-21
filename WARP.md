# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start development server (localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code with ESLint
npm run lint
```

### Docker Development
```bash
# Start development environment with hot reload
docker compose up -d

# View development logs
docker compose logs -f terminal-chat-dev

# Stop development environment
docker compose down

# Build production Docker image
docker build -t terminal-chat-app .

# Run production container
docker run -p 80:80 terminal-chat-app
```

## Architecture Overview

This is a React 18 single-page application with a terminal-style chat interface, built using Vite and styled with Tailwind CSS using the Catppuccin color scheme.

### Key Components Architecture

**App Structure**: Simple React Router setup with main route redirecting to `/chat`

**ChatPage**: The main chat interface that includes:
- Setup wizard for Wazuh configuration (username, password, JSON rules file)
- Terminal-style message display with typing animation effects
- Chat session management with localStorage persistence
- File upload handling for JSON rules configuration
- Keyboard shortcuts (Ctrl+B for sidebar toggle)

**Sidebar**: Animated slide-in navigation with:
- Chat session history
- New session creation
- Wazuh reconfiguration option
- Framer Motion animations with spring physics

### State Management
- React hooks (useState, useRef, useEffect) for local component state
- localStorage for persistent Wazuh configuration
- No global state management library (Redux, Zustand, etc.)

### Styling System
- Tailwind CSS utility-first approach
- Custom Catppuccin color palette (`ctp-*` classes) 
- Additional terminal colors (`term-*` classes)
- Fira Code monospace font for terminal aesthetic
- Responsive design with mobile support

### Animation System
- Framer Motion for component animations
- Typing effect simulation for assistant messages
- Spring-based sidebar transitions
- Smooth scrolling for message area

## Project-Specific Patterns

### Message Types
Messages use a type-based system with prefixes:
- `system`: Configuration and status messages
- `user`: User input messages  
- `assistant`: AI/system responses with typing animation

### Setup Wizard Flow
The app implements a multi-step setup wizard:
1. Username collection
2. Password collection  
3. JSON rules file upload
4. Configuration completion and persistence

### File Handling
- JSON validation for rules file uploads
- FileReader API for client-side file processing
- Error handling for invalid file formats

### Terminal UI Patterns
- Monospace font throughout
- Message prefixes ([USER], [ASSISTANT], [SYSTEM])
- Auto-scrolling chat area
- Terminal-style prompt character (`>`)
- Dark theme with terminal colors

## Development Notes

### Hot Reload
Development server runs on port 5173 with Vite's fast HMR. Docker development setup includes volume mounting for live code changes.

### ESLint Configuration
Configured for React with JSX support, unused variable detection, and React Hooks rules enforcement.

### Docker Strategy
- Multi-stage production build with nginx serving static files
- Separate development container with live mounting
- Alpine Linux base images for smaller size
