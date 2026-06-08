
# Habittos

Habittos is an offline-first habit-tracking application designed to help you build, monitor, and sustain daily routines. Featuring a dark, neon-accented user interface, it provides clear progress visualizations, flexible schedule tracking, and actionable habit statistics without relying on cloud-connected databases.

---

## Preview

| Checklist Tracker | Habit Analytics & Details |
| :---: | :---: |
| <img src="assets/tracker.png" width="350" alt="Checklist Tracker Interface"/> | <img src="assets/stats.png" width="350" alt="Habit Analytics View"/> |

---

## Key Features

*   **Interactive Checklist Tracker**: Log your progress quickly by tapping on the status block emojis to cycle through completion states (`❌` -> `✅` -> `➖`).
*   **Recent History Metrics**: Review your execution consistency at a glance with status pills for recent days (`TDY`, `S7`, `S6`, `F5`, `T4`) alongside calculated completion rates.
*   **Visual Streaks**: Keep track of consecutive successful days with built-in streak counters and visual heat flags.
*   **Detailed Analytics**: 
    *   **Habit Strength & Score Curve**: Track progress patterns over a rolling 15-day window.
    *   **Weekly Session Distribution**: View your historical session density categorized by each day of the week.
*   **Flexible Scheduling**: Configure custom daily routines or specific intervals, with personalized reminder times (e.g., morning and evening alerts).
*   **Secure & Local**: Runs as a secure offline-first application, keeping your personal performance data isolated safely on your device.
*   **Customization**: Built-in styling tools via the `Design` manager to adjust visual components.

---

## Technical Overview

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MrSavage009/Habittos-.git
   cd Habittos-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```

*(Adjust the build commands if your project uses a different framework or build system.)*

---

## How It Works

1.  **Checklist Tracker**: The main panel displays your currently active habits. Tap a habit's title to modify its parameters, or tap the individual day blocks to update your log status.
2.  **Stats**: Access deep metrics for any single habit to evaluate strength curves and weekly distributions.
3.  **Sim (Simulator)**: Use the built-in simulator module to preview or test out habit structures and projection rates over time.
4.  **Import & Export**: Use the download and upload action buttons at the top right to safely back up or restore your local database JSON file.

---

## License

This project is licensed under the [MIT License](LICENSE).
