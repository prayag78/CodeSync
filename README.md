# CodeSync - Real-Time Collaborative Code Editor

CodeSync is a modern, real-time collaborative code editor that enables users to code together in real-time. Built with Next.js, Socket.IO, WebRTC and Monaco Editor, it provides a seamless coding experience with features like video calls and multi-language support.

![CodeSync Hero Section](./public/image.png)

## 🚀 Features

### Core Features

- **Real-time Code Collaboration**: Users can edit code simultaneously
- **Multi-language Support**: Support for various programming languages
- **Room-based Collaboration**: Create or join rooms for focused coding sessions
- **User Limit**: Maximum 2 users per room for optimal performance
- **Video Calling**: Built-in WebRTC video calls for face-to-face collaboration

### Advanced Features

- **Code Execution**: Run code directly in the editor
- **Input/Output Support**: Handle program input and display output
- **Language Switching**: Switch between different programming languages on the fly

### User Experience

- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Real-time Notifications**: Toast notifications for important events
- **Room Management**: Easy room creation and joining system

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **WebRTC APIs** - Real-time video/audio calling
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - Professional code editor (same as VS Code)
- **Socket.IO Client** - Real-time communication
- **Zustand** - State management
- **Shadcn UI** - Accessible UI components
- **Lucide React** - Beautiful icons

### Backend

- **Socket.IO Server** - Real-time WebSocket server ([Repository](https://github.com/prayag78/socket-server))
- **Express.js** - Web server framework
- **Node.js** - JavaScript runtime
- **Typescript** - Type-safe JavaScript

### Authentication & Database

- **Clerk** - Authentication and user management
- **Prisma** - Database ORM
- **Neon DB** - Database (via Prisma)

## 📁 Project Structure

### Frontend (CodeSync)

```
codesync/
├── src/
│   ├── actions/               # Server actions
│   ├── app/
│   │   ├── editor/            # Editor pages
│   │   │   ├── page.tsx       # Editor page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page (Login/Signup)
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── editor.tsx         # Code editor component
│   │   ├── navbar.tsx         # Navigation bar
│   │   ├── video-call.tsx     # Video calling component
│   │   └── ...                # Other components
│   ├── lib/                   # Utility libraries
│   │   ├── constants.ts       # Application constants and starter code
│   │   ├── prisma.ts          # Prisma client configuration
│   │   ├── socket-client.ts   # Socket.IO client utilities
│   │   └── utils.ts           # General utilities (clsx, tailwind-merge)
│   ├── hooks/                 # Custom React hooks
│   ├── generated/             # Generated files (Prisma)
│   └── middleware.ts          # Clerk authentication middleware
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

### Backend (Socket Server)

```
socket-server/
├── src/
│   └── index.ts              # Socket.IO server implementation
├── dist/                     # Compiled JavaScript files
├── node_modules/             # Dependencies
├── package.json              # Server dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

**Repository Structure:**

- **Frontend**: [CodeSync Repository](https://github.com/prayag78/codesync) - Next.js application
- **Backend**: [Socket Server Repository](https://github.com/prayag78/socket-server) - Node.js Socket.IO server

### Key Files Explained

**Core Libraries (`src/lib/`):**

- `constants.ts` - Contains starter code templates for different programming languages and user data
- `prisma.ts` - Database client configuration and connection management
- `socket-client.ts` - Socket.IO client setup, room management, and WebRTC signaling functions
- `utils.ts` - Utility functions for class name merging (clsx + tailwind-merge)

**Authentication:**

- `middleware.ts` - Clerk authentication middleware for protecting routes

## 🚀 Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/prayag78/codesync
   cd codesync
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL=

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=

   # Socket Server (Local Development)
   NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Socket.IO server (Required for real-time features)**

   ```bash
   # Clone the socket server repository
   git clone https://github.com/prayag78/socket-server
   cd socket-server
   npm install
   npm run dev
   ```

   The socket server will run on `http://localhost:8000`.

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

**Important Notes:**

- Both servers must be running simultaneously for full functionality
- Frontend: `http://localhost:3000` (Next.js app)
- Backend: `http://localhost:8000` (Socket.IO server)
- Make sure your `NEXT_PUBLIC_SOCKET_URL` environment variable points to `http://localhost:8000`

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Socket Server

1. Clone the [Socket Server Repository](https://github.com/prayag78/socket-server)
2. Deploy to a Node.js hosting service (Railway, Render, etc.)
3. Update `NEXT_PUBLIC_SOCKET_URL` in frontend

### Database

1. Set up PostgreSQL database (Neon DB, Supabase etc.)
2. Update `DATABASE_URL` in environment variables
3. Run `npx prisma db push` to sync schema

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
