# Financial Dashboard

A comprehensive personal finance tracking application built with React, Express, and TypeScript. Track transactions, manage budgets, analyze spending patterns, and gain insights into your financial health with Indian Rupee support.

## Features

- **Transaction Management**: Full CRUD operations for income and expenses
- **Category Organization**: Separate income and expense categories with visual icons
- **Budget Tracking**: Set monthly budgets and track progress with visual indicators
- **Financial Reports**: Comprehensive analytics with charts and data export
- **Dashboard Analytics**: Real-time financial insights and spending trends
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: MongoDB with Mongoose (includes in-memory fallback)
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git**
- **VS Code** (recommended editor)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-finance-tracker
```

### 2. Install Dependencies

```bash
npm install
```

This will install all necessary dependencies for both frontend and backend.

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
# Optional: MongoDB connection string
# If not provided, the app will use in-memory storage
MONGODB_URI=mongodb://localhost:27017/finance-tracker

# Development settings
NODE_ENV=development
PORT=5000
```

### 4. Start the Development Server

```bash
npm run dev
```

This command will:
- Start the Express backend server on port 5000
- Start the Vite frontend development server
- Open the application in your browser automatically

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── lib/           # Utility functions and configurations
│   │   └── App.tsx        # Main app component and routing
├── server/                # Backend Express application
│   ├── routes.ts          # API endpoints
│   ├── mongodb-storage.ts # MongoDB data layer
│   ├── mongo-memory-storage.ts # In-memory fallback storage
│   └── index.ts           # Server entry point
├── shared/                # Shared TypeScript types and schemas
├── components/            # Additional shared components
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development servers (frontend + backend)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking

## VS Code Setup

### Recommended Extensions

Install these VS Code extensions for the best development experience:

1. **ES7+ React/Redux/React-Native snippets**
2. **TypeScript Importer**
3. **Tailwind CSS IntelliSense**
4. **Auto Rename Tag**
5. **Bracket Pair Colorizer**
6. **GitLens**
7. **Prettier - Code formatter**
8. **ESLint**

### VS Code Settings

Create `.vscode/settings.json` in your project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Debugging Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Node.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "tsx/cjs"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## Database Setup

### Option 1: In-Memory Storage (Default)
The application includes an in-memory storage system that works out of the box with sample data. No additional setup required.

### Option 2: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Update the `MONGODB_URI` in your `.env` file

### Option 3: MongoDB Atlas (Cloud)
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your `.env` file

## Features Guide

### Dashboard
- View financial overview with summary cards
- Interactive charts showing spending trends
- Recent transactions list
- Category-wise expense breakdown

### Transactions
- Add, edit, and delete transactions
- Filter by category, type, date range
- Search functionality
- Bulk operations

### Categories
- Manage income and expense categories
- Custom icons and colors
- Visual category organization

### Budget
- Set monthly spending limits per category
- Track budget progress with visual indicators
- Over-budget alerts and notifications
- Budget performance analysis

### Reports
- Comprehensive financial analytics
- Multiple chart types (bar, pie, line)
- Date range filtering
- Export data to CSV format
- Trend analysis and insights

## Customization

### Adding New Categories
1. Navigate to Categories page
2. Click "Add Category"
3. Choose name, type, color, and icon
4. Save to start using in transactions

### Setting Up Budgets
1. Go to Budget page
2. Click "Add Budget"
3. Select category and set amount
4. Choose month and year
5. Track progress on the dashboard

### Exporting Data
1. Visit Reports page
2. Select desired date range
3. Click "Export CSV"
4. Data will download automatically

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 5000
npx kill-port 5000
npm run dev
```

**Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
# Run type checking
npm run type-check
```

**Database connection issues**
- Check MongoDB service is running
- Verify connection string in `.env`
- Application will fallback to in-memory storage

### Getting Help

1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure Node.js version is 18 or higher
4. Try restarting the development server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.