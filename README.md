# Xtrinox Cloud Platform

The Xtrinox Cloud Platform is a premium AI marketplace and session-bridging dashboard. It allows users to manage their premium AI subscriptions (e.g., ChatGPT Plus) and securely bridge them into their local browser using the companion **Xtrinox Bridge** extension.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management**: Zustand
- **Backend/Auth**: Firebase (Authentication, Firestore Database)
- **Routing**: React Router DOM

## Core Features
- **Secure Authentication**: Firebase-backed email/password and social login.
- **Premium Subscription Management**: Browse and purchase AI subscriptions via a sleek, modern UI.
- **Session Bridging (The Bridge)**: Seamlessly inject premium session tokens into the browser via encrypted payloads sent to the Xtrinox Chrome Extension.
- **Admin Portal**: A dedicated administration dashboard (`/admin`) for managing users, overriding subscriptions, and generating secure bridge payloads.
- **Responsive Design**: Fully responsive, dark-mode optimized "glassmorphism" aesthetic.

## Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Companion Extension
To utilize the session bridging functionality, users must install the **Xtrinox Bridge** Chrome extension (located in `../xtrinox_unpack`). The web portal communicates securely with this extension to handle session orchestration.

---
Developed by Mughal.
