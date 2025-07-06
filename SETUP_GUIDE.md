# VS Code Setup Guide for Personal Finance Tracker

This guide will help you set up and run the Personal Finance Tracker application in VS Code on your local machine.

## Quick Start (TL;DR)

1. **Prerequisites**: Install Node.js 18+, Git, and VS Code
2. **Clone**: `git clone <repo-url> && cd personal-finance-tracker`
3. **Install**: `npm install`
4. **Run**: `npm run dev`
5. **Open**: `http://localhost:5000`

## Detailed Setup Instructions

### Step 1: Install Prerequisites

#### Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download and install Node.js version 18 or higher
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Install Git
1. Go to [git-scm.com](https://git-scm.com/)
2. Download and install Git
3. Verify installation:
   ```bash
   git --version
   ```

#### Install VS Code
1. Go to [code.visualstudio.com](https://code.visualstudio.com/)
2. Download and install VS Code
3. Launch VS Code

### Step 2: Download the Project

#### Option A: Clone from Repository
```bash
git clone <repository-url>
cd personal-finance-tracker
```

#### Option B: Download ZIP
1. Download the project as a ZIP file
2. Extract it to your desired folder
3. Open terminal/command prompt in that folder

### Step 3: Open in VS Code

1. Open VS Code
2. Use one of these methods:
   - **File → Open Folder** and select your project folder
   - **Terminal**: `code .` (in project directory)
   - **Drag and drop** the project folder onto VS Code

### Step 4: Install Dependencies

Open VS Code's integrated terminal (`Ctrl+`` or `View → Terminal`) and run:

```bash
npm install
```

This will install all required packages (~30 seconds).

### Step 5: Install Recommended Extensions

VS Code will prompt you to install recommended extensions. Click **"Install All"** or install manually:

**Essential Extensions:**
- **Prettier** - Code formatter
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **TypeScript Importer** - Auto imports
- **ESLint** - Code linting
- **Auto Rename Tag** - HTML tag renaming

**Optional but Helpful:**
- **GitLens** - Git integration
- **Error Lens** - Inline error display
- **Path Intellisense** - File path autocomplete

### Step 6: Start the Application

In VS Code terminal, run:

```bash
npm run dev
```

You should see:
```
[express] serving on port 5000
[vite] ready in 1500ms
```

The application will automatically open in your browser at `http://localhost:5000`

## VS Code Features & Tips

### Debugging
1. Press `F5` or go to **Run → Start Debugging**
2. Choose "Debug Full Stack" configuration
3. Set breakpoints by clicking left of line numbers
4. Use debug console for testing expressions

### Code Navigation
- **Ctrl+P**: Quick file search
- **Ctrl+Shift+P**: Command palette
- **F12**: Go to definition
- **Alt+F12**: Peek definition
- **Ctrl+`**: Toggle terminal

### Code Formatting
- **Shift+Alt+F**: Format entire file
- **Ctrl+K, Ctrl+F**: Format selection
- Code auto-formats on save (configured)

### IntelliSense & Autocomplete
- Type and get suggestions automatically
- **Ctrl+Space**: Force trigger suggestions
- **Ctrl+.**: Quick fixes and refactoring

## Project Structure Overview

```
personal-finance-tracker/
├── client/src/           # React frontend
│   ├── components/       # UI components
│   ├── pages/           # Main pages (Dashboard, Transactions, etc.)
│   ├── lib/             # Utilities and configurations
│   └── App.tsx          # Main app and routing
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── models.ts        # Database models
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
├── .vscode/             # VS Code configuration
├── package.json         # Dependencies and scripts
└── README.md           # Main documentation
```

## Common Commands

```bash
# Development
npm run dev              # Start development servers
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run type-check      # Check TypeScript types
npm run lint           # Run ESLint (if configured)

# Database
npm run db:reset       # Reset sample data (if applicable)
```

## Environment Variables (Optional)

Create `.env` file in project root for custom configuration:

```bash
# MongoDB connection (optional - uses in-memory storage by default)
MONGODB_URI=mongodb://localhost:27017/finance-tracker

# Server settings
NODE_ENV=development
PORT=5000
```

## Features to Explore

### 1. Dashboard
- Financial overview with charts
- Summary cards showing key metrics
- Recent transactions list

### 2. Transactions
- Add income and expenses
- Edit and delete transactions
- Filter and search functionality

### 3. Categories
- Manage transaction categories
- Custom colors and icons
- Separate income/expense categories

### 4. Budget
- Set monthly spending limits
- Track budget progress
- Visual indicators and alerts

### 5. Reports
- Comprehensive financial analytics
- Multiple chart types
- Data export to CSV

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000
# Or use different port
PORT=3000 npm run dev
```

### Module Not Found Errors
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
- Check VS Code problems panel (`Ctrl+Shift+M`)
- Run `npm run type-check` in terminal
- Restart TypeScript service: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Git Issues
```bash
# If cloning fails, try downloading ZIP instead
# Or check Git configuration:
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### VS Code Not Recognizing TypeScript
1. Open any `.ts` or `.tsx` file
2. Bottom right corner should show TypeScript version
3. If not, install TypeScript globally: `npm install -g typescript`

## Development Workflow

1. **Start development**: `npm run dev`
2. **Make changes**: Edit files in VS Code
3. **See live updates**: Browser refreshes automatically
4. **Add features**: Create new components/pages
5. **Test functionality**: Use browser dev tools
6. **Debug issues**: Use VS Code debugger or console

## Getting Help

### In VS Code
- **F1**: Open command palette for help
- **Ctrl+Shift+P**: Access all VS Code commands
- **View → Problems**: See all errors and warnings

### Documentation
- Hover over functions/variables for inline docs
- **F12**: Go to definitions to understand code
- Check `README.md` for feature documentation

### Online Resources
- [VS Code Documentation](https://code.visualstudio.com/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Next Steps

Once you have the application running:

1. **Explore the interface** - Navigate through all pages
2. **Add sample data** - Create transactions, categories, budgets
3. **Check the code** - Look at component structure in VS Code
4. **Customize features** - Modify colors, add new functionality
5. **Deploy** - Consider deployment options for sharing

Your development environment is now ready! The application includes sample data and works offline, so you can start exploring immediately.