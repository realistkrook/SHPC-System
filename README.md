# Aotea College House Points System

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white)

A modern, real-time house points tracking system built for Aotea College. This application allows staff to award points to houses, tracks requests, and displays a live leaderboard for students and visitors.

**Created by Connor Sheffield as a personal project for Aotea College.**

## Features

*   **Live Leaderboard**: Real-time updates of house points (Pūkeko, Kererū, Kōrimako, Kōtuku).
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

## License

Private / Personal Project.
