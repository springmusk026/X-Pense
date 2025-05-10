# X-Pense

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](package.json)
[![React Native](https://img.shields.io/badge/React%20Native-0.76.7-61DAFB.svg?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~52.0.36-000020.svg?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-^5.3.3-blue.svg?logo=typescript)](https://www.typescriptlang.org/)

A comprehensive mobile application designed to help users track and manage their expenses efficiently. Built with Expo and React Native, this app offers a seamless cross-platform experience.

**Please Note:** This is primarily a learning project. While functional, there might be areas for improvement, potential flaws, or bugs. Contributions, suggestions, and constructive feedback aimed at enhancing the project are highly encouraged and appreciated!

## ✨ Features

*   **Expense Tracking:** Easily add, view, edit, and delete expenses.
*   **Categorization:** Organize expenses into categories for better insights.
*   **Recurring Expenses:** Manage and track regular payments like subscriptions or bills.
*   **Card Management:** Keep track of expenses made with different credit/debit cards.
*   **Budgeting:** Set and monitor budgets to stay on top of your finances (inferred from `BudgetAlert`, `BudgetModal`).
*   **Reporting:** Generate reports to visualize spending patterns (inferred from `app/(tabs)/reports/`).
*   **Data Visualization:** Charts and graphs to understand expense distribution (inferred from `victory-native`).
*   **Receipt Scanning:** Capture and attach receipts to expenses (inferred from `ReceiptScanner`, `expo-image-picker`).
*   **Split Expenses:** Divide expenses among multiple people (inferred from `SplitExpenseModal`).
*   **Filtering & Sorting:** Advanced filtering options for expenses (e.g., by date range, category).
*   **Authentication:** Secure user accounts (inferred from `app/(auth)/` and `expo-local-authentication`, `expo-secure-store`).
*   **Notifications:** Reminders for upcoming payments or budget alerts (inferred from `utils/notifications.ts`, `expo-notifications`).
*   **Data Backup & Restore:** Securely back up and restore your financial data (inferred from `components/BackupRestoreModal.tsx`, `utils/backup.ts`).
*   **Data Export:** Export expense data in various formats (inferred from `utils/export.ts`, `expo-sharing`).
*   **Cross-Platform:** Runs on both iOS and Android devices thanks to Expo and React Native.

## 🛠️ Tech Stack

*   **Framework:** React Native with Expo
*   **Language:** TypeScript
*   **Navigation:** Expo Router
*   **State Management:** Redux Toolkit
*   **Database:** Expo SQLite (local storage)
*   **UI Components:** React Native core components, Expo Blur, Expo Linear Gradient, React Native SVG
*   **Forms:** Formik with Yup for validation
*   **Charting:** Victory Native
*   **Linting:** ESLint with `eslint-config-expo`
*   **Styling:** (Likely inline styles or StyleSheet, common in React Native)

##  Prerequisites

Before you begin, ensure you have met the following requirements:
*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
*   An Android Emulator/Device or iOS Simulator/Device.

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd expense-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory if there are specific environment variables required (e.g., API keys). Refer to `.env.example` if provided (though not listed in current files).

4.  **Run the application:**

    *   **For development server (Expo Go or web):**
        ```bash
        npm run dev
        ```
        Then, scan the QR code with the Expo Go app on your mobile device, or select an option to run on an emulator/simulator or in the web browser.

    *   **To build and run on Android:**
        ```bash
        npm run android
        ```

    *   **To build and run on iOS:**
        ```bash
        npm run ios
        ```

## 📜 Available Scripts

In the project directory, you can run the following scripts:

*   `npm run dev`: Starts the Expo development server.
*   `npm run android`: Builds and runs the app on a connected Android device or emulator.
*   `npm run ios`: Builds and runs the app on an iOS simulator or connected device.
*   `npm run lint`: Lints the codebase using ESLint to check for code quality and style issues.

## 📁 Project Structure

The project follows a standard Expo and React Native structure:

```
X-Pense/
├── app/                      # Main application code, organized by routes (Expo Router)
│   ├── (auth)/               # Authentication screens
│   ├── (tabs)/               # Tab-based navigation screens (Expenses, Cards, Reports, More)
│   ├── _layout.tsx           # Root layout component
│   └── router.config.ts      # Router configuration
├── assets/                   # Static assets like fonts and images
├── components/               # Reusable UI components
│   └── navigation/           # Navigation-specific components (e.g., custom TabBar)
├── database/                 # SQLite database setup, models, and utilities
│   ├── core/
│   ├── models/
│   ├── types/
│   └── utils/
├── store/                    # Redux store configuration and slices
│   └── slices/               # Redux state slices for different features
├── utils/                    # Utility functions (backup, export, notifications, etc.)
├── .env                      # Environment variables (if any, not committed)
├── .eslintrc.js              # ESLint configuration
├── .gitignore                # Specifies intentionally untracked files that Git should ignore
├── .prettierrc               # Prettier code formatter configuration
├── app.json                  # Expo configuration file
├── eas.json                  # EAS Build configuration
├── package.json              # Project metadata and dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please make sure to update tests as appropriate and follow the existing code style.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details (assuming MIT, you can change this or create the file).

---

*This README was generated based on the project structure and `package.json`.*
