# 🎹 Pocket Piano

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/moussandou/pocket-piano)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![Powered by Firebase](https://img.shields.io/badge/Powered%20by-Firebase-FFCA28?logo=firebase)](https://firebase.google.com/)

**Pocket Piano** is a high-performance, professional-grade virtual piano application built for the modern web. It combines low-latency audio Synthesis with cloud-powered features, providing an immersive musical experience directly in your browser.

---

## ✨ Key Features

- 🎵 **High-Fidelity Audio**: Powered by **Tone.js** for studio-quality sound synthesis and low-latency response.
- ☁️ **Cloud Sync**: Seamlessly save your recordings, progress, and preferences across devices via **Firebase**.
- 🎹 **MIDI Support**: Plug in your external MIDI keyboard and play with full velocity sensitivity.
- 🎙️ **Internal Recorder**: Capture your performances in high-quality MP3 format and share them instantly.
- 🏆 **Gamification**: Stay motivated with daily streaks, XP gains, and unlockable badges as you practice.
- 📂 **Session History**: Detailed stats and history of your playing sessions to track your progression.
- 🌐 **Multilingual**: Full support for English and French with a smooth **i18next** integration.
- 🎨 **Premium UI**: A sleek, dark-themed interface designed with **Glassmorphism** and fluid animations for a premium feel.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Audio Engine**: [Tone.js](https://tonejs.github.io/)
- **Backend/BaaS**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Hosting)
- **Styling**: Vanilla CSS (Modern Custom Properties & Flexbox/Grid)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks & Context API
- **Internationalization**: [react-i18next](https://react.i18next.com/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0 or higher
- **npm** or **yarn**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/moussandou/pocket-piano.git
   cd pocket-piano
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory based on `.env.example` and add your Firebase configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
src/
├── components/   # Reusable UI components (Piano, Modals, Gallery)
├── engine/       # Core audio logic and Tone.js synthesis
├── domain/       # Business logic and entity definitions
├── infra/        # Firebase configurations and API repositories
├── hooks/        # Custom React hooks for state and audio control
├── pages/        # Main application views (Landing, Studio, Profile)
├── locales/      # i18n translation files
└── utils/        # Helper functions and constants
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve Pocket Piano, please feel free to:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ☕ Support

If you find this project useful and want to support its development, feel free to buy me a coffee!

[![Kofi](https://img.shields.io/badge/Support-Kofi-F16061?logo=ko-fi)](https://ko-fi.com/moussandou)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

Developed with ❤️ by [Moussandou](https://github.com/moussandou).
