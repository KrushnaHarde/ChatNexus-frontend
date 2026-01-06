# 💬 ChatNexus React

A modern, real-time chat application built with React and WebSocket technology. This is the frontend client for the [ChatNexus](https://github.com/krushna06/ChatNexus) Spring Boot backend.

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-green?style=flat)

## ✨ Features

- 🔐 **Authentication** - Secure login and registration with JWT tokens
- 💬 **Real-time Messaging** - Instant message delivery using WebSocket (STOMP protocol)
- 📷 **Media Sharing** - Send images, videos, and audio files with captions
- ✅ **Message Status** - See sent, delivered, and read receipts (with timestamps)
- 👥 **Online Status** - Real-time user presence indicators
- 🔍 **User Search** - Find and start conversations with other users
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌙 **Dark Theme** - Beautiful dark UI with gradient accents
- 🖼️ **Image Lightbox** - Full-screen image preview
- 🎵 **Media Preview** - Audio/video playback in chat

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **STOMP.js** - WebSocket messaging protocol
- **SockJS** - WebSocket fallback support
- **Lucide React** - Beautiful icons

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- [ChatNexus Backend](https://github.com/KrushnaHarde/ChatNexus-backend) running on port 8080

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/krushna06/ChatNexus-React.git
   cd ChatNexus-React
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🚀 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 📁 Project Structure

```
ChatNexus-React/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ChatArea.jsx    # Main chat interface
│   │   ├── Message.jsx     # Message bubble component
│   │   └── Sidebar.jsx     # Contacts sidebar
│   ├── context/         # React Context providers
│   │   ├── AuthContext.jsx # Authentication state
│   │   └── ChatContext.jsx # Chat & WebSocket state
│   ├── pages/           # Page components
│   │   ├── AuthPage.jsx    # Login/Register page
│   │   └── ChatPage.jsx    # Main chat page
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8080` |

### API Proxy (Development)

The development server proxies these endpoints to the backend:

| Endpoint | Description |
|----------|-------------|
| `/api/*` | Authentication & Media upload |
| `/ws` | WebSocket connection |
| `/users/*` | User management |
| `/messages/*` | Chat messages |
| `/contacts/*` | User contacts |

## 🎨 UI Features

- **Message Bubbles** - Gradient styling for sent messages
- **Status Indicators** - ✓ Sent, ✓✓ Delivered, ✓✓ Read (blue)
- **Hover Timestamps** - View sent & read times on hover
- **Media Indicators** - 📷 Photo, 🎬 Video, 🎵 Audio labels in sidebar
- **Typing Animation** - Smooth message animations
- **Responsive Sidebar** - Collapsible on mobile

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Krushna**

---

<p align="center">
  Made with ❤️ by Krushna
</p>
