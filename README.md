# QuizBlitz — Real-Time Quiz Platform

A full-stack real-time quiz platform designed with a modern dark SaaS aesthetic, featuring interactive UI elements, real-time leaderboards, and a comprehensive anti-cheat engine.

## Features

- **Role-Based Workflows**: Dedicated dashboards for Admins, Hosts, and Players.
- **Modern UI**: Deep dark SaaS design with neon lime accents and UIverse-inspired card animations.
- **Authentication**: Secure JWT-based registration and login system.
- **Quiz Management**: Full CRUD operations for creating, editing, and deleting quizzes.
- **Real-Time Multiplayer**: Instant synchronization via Socket.io for multiplayer rooms.
- **Engaging Gameplay**: Live countdown timer (SVG ring) and instant leaderboard updates with speed-based bonus scoring.
- **Anti-Cheat Engine**: Built-in tab-switch detection and one-answer-per-question enforcement.
- **Analytics Dashboard**: Comprehensive statistics and insights for post-quiz review.

## Tech Stack

- **Frontend**: React, Vite, Socket.io-client, Axios, Lucide React (Icons)
- **Backend**: Node.js, Express, Socket.io, JWT, bcryptjs
- **Database**: SQLite (via `better-sqlite3`)
- **Design System**: Vanilla CSS, Custom Deep Dark Theme (`#050505`), Google Fonts (Space Grotesk & Inter)

## Getting Started

Follow these instructions to run the application locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SrithanPenugonda2006/quizblitz-platform.git
   cd quizblitz-platform
   ```

2. **Install dependencies:**
   The project has dependencies in the root, `/frontend`, and `/backend` directories.

   ```bash
   npm install

   cd frontend
   npm install

   cd ../backend
   npm install
   ```

3. **Running the application locally:**
   Return to the root directory and use the development script to start both the frontend and backend concurrently.

   ```bash
   npm run dev
   ```

   - **Frontend UI** will be available at: `http://localhost:5173`
   - **Backend API** will run on: `http://localhost:4000`

## Contributing

Feel free to open issues or submit pull requests with improvements.

## License

This project is open-source and available for usage.
