# School House Point Counting System

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white)

A modern, real-time house points tracking system built for Aotea College. This application allows staff to award points to houses, tracks requests, and displays a live leaderboard for students and visitors.

**Created by Connor Sheffield as a personal project for Aotea College.**

## Features

*   **Live Leaderboard**: Real-time updates of house points (Pūkeko, Kererū, Korimako, Kōtuku).
*   **TV Mode**: A dedicated, responsive full-screen view for digital signage.
*   **Staff Authentication**: Secure login via Microsoft (Azure AD) for staff and student leaders.
*   **Role-Based Access**:
    *   **Teachers**: Can submit point requests.
    *   **Whanau Leaders**: Can approve/reject requests.
    *   **Admins**: Full system control (manage users, manual overrides).
*   **Dark Mode**: Sleek UI with Aotea College branding.

## Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS v4
*   **Backend**: Supabase (PostgreSQL, Auth, Realtime)
*   **Authentication**: Microsoft Azure AD (Multitenant)

## Setup

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Create a `.env.local` file with your Supabase credentials:
    ```
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```
4.  Run locally: `npm run dev`

## Windows Teacher Quick Start (Postgres App)

1. Install Node.js LTS from https://nodejs.org
2. Install PostgreSQL for Windows from https://www.postgresql.org/download/windows/
3. Open PowerShell in the project folder and go to `postgres-app`
4. Run `run-windows-setup.cmd`
5. Enter your PostgreSQL username when prompted (default is `postgres`)

PowerShell commands (recommended):

```powershell
cd "C:\path\to\Aotea College House Points\postgres-app"
.\run-windows-setup.cmd
```

Manual PowerShell commands (if needed):

```powershell
cd "C:\path\to\Aotea College House Points\postgres-app"
copy .env.example .env
npm run install:all
psql -U postgres -d postgres -c "CREATE DATABASE house_points;"
psql -U postgres -d house_points -f db/schema.sql
psql -U postgres -d house_points -f db/seed.sql
npm run dev
```

The script will:
- Create `.env` from `.env.example` if needed
- Install server and client dependencies
- Create the `house_points` database if it does not exist
- Apply schema and seed data
- Start the app

Open:
- Frontend: `http://localhost:3000`
- API health: `http://localhost:3001/api/health`

## License

Private / Personal Project.
