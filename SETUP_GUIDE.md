# Financial Dashboard - Setup Guide

## Prerequisites

Before you start, make sure you have the following installed on your computer:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Check installation: `node --version`

2. **Git** (optional, but recommended)
   - Download from: https://git-scm.com/

3. **VS Code**
   - Download from: https://code.visualstudio.com/

## Setup Instructions

### Step 1: Extract and Open Project

1. **Extract the zip file** to your desired location
2. **Open VS Code**
3. **Open the project folder** in VS Code:
   - Go to `File` → `Open Folder`
   - Select the extracted project folder
   - Click "Open"

### Step 2: Install Dependencies

1. **Open the integrated terminal** in VS Code:
   - Press `Ctrl + `` (backtick) or go to `Terminal` → `New Terminal`

2. **Install project dependencies**:
   ```bash
   npm install
   ```
   
   This will install all required packages listed in `package.json`

### Step 3: Environment Setup

1. **Create environment file** (optional):
   ```bash
   cp .env.example .env
   ```
   
   If you want to use MongoDB, add your connection string:
   ```
   MONGODB_URI=your_mongodb_connection_string_here
   ```

2. **The application works out of the box** with in-memory storage if no MongoDB connection is provided.

### Step 4: Start the Application

1. **Run the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

3. **You should see the Financial Dashboard** with sample data already loaded.

## Project Structure

```
financial-dashboard/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   └── lib/          # Utility functions
├── server/                # Backend Express server
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   └── mongo-memory-storage.ts  # Data storage
├── shared/               # Shared types and schemas
├── package.json         # Dependencies and scripts
└── README.md           # Project documentation
```

## Available Scripts

- `npm run dev` - Start development server (both frontend and backend)
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes (if using database)

## Features

### Dashboard Components
- **Summary Cards**: Total balance, monthly income/expenses, savings rate
- **Monthly Expenses Chart**: Interactive bar chart with time filtering
- **Category Pie Chart**: Expense breakdown by category
- **Recent Transactions**: Latest financial transactions
- **Budget Tracker**: Monthly budget vs actual spending

### Data Management
- **In-Memory Storage**: Works without database setup
- **MongoDB Support**: Optional cloud database integration
- **Sample Data**: Pre-loaded with realistic financial data
- **Indian Rupee Formatting**: All amounts displayed in ₹ format

## Customization

### Adding Your Own Data

1. **Modify sample data** in `server/mongo-memory-storage.ts`
2. **Update categories** by editing the `initializeDefaultCategories()` method
3. **Add transactions** by modifying the `initializeSampleData()` method
4. **Adjust budgets** by updating the `sampleBudgets` array

### Styling Changes

1. **Colors and themes** can be modified in `tailwind.config.ts`
2. **Component styles** are in individual component files under `client/src/components/`
3. **Global styles** are in `client/src/index.css`

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Stop other applications using port 5000
   - Or modify the port in `server/index.ts`

2. **Dependencies not installing**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript errors**:
   - Make sure VS Code TypeScript extension is enabled
   - Restart VS Code if needed

4. **MongoDB connection issues**:
   - The app automatically falls back to in-memory storage
   - Check your MONGODB_URI in .env file if using database

### VS Code Extensions (Recommended)

Install these extensions for better development experience:

1. **ES7+ React/Redux/React-Native snippets**
2. **Tailwind CSS IntelliSense**
3. **TypeScript Importer**
4. **Auto Rename Tag**
5. **Prettier - Code formatter**

## Development Tips

1. **Hot Reload**: The development server automatically reloads when you make changes
2. **Console Logs**: Check browser developer tools for frontend logs
3. **API Testing**: Server logs appear in the VS Code terminal
4. **Database Viewer**: Use MongoDB Compass if connecting to MongoDB

## Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Deploy to cloud platforms** like Vercel, Netlify, or Heroku

## Support

If you encounter any issues:

1. Check the terminal for error messages
2. Verify all dependencies are installed correctly
3. Ensure Node.js version is 18 or higher
4. Make sure port 5000 is available

---

**Enjoy using your Financial Dashboard!** 🎉

The application comes with realistic sample data and is ready to use immediately after setup.