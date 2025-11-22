# Screenshots → Bug Report 🎫

**Turn screenshots into perfect Linear tickets automatically using AI.**

Save 10+ minutes per bug report with AI-powered screenshot analysis, automatic ticket formatting, and seamless Linear integration.

![Screenshot to Bug Report](https://img.shields.io/badge/AI-Powered-blue) ![Linear](https://img.shields.io/badge/Linear-Integration-purple) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-green)

## ✨ Features

- **🔍 AI Vision Analysis**: Claude 3.5 Sonnet analyzes screenshots to extract:
  - Bug descriptions
  - Error messages (OCR)
  - Visible URLs
  - UI state and context
  - Severity levels

- **🎨 Beautiful Web UI**: Modern drag-and-drop interface with:
  - Glassmorphism design
  - Real-time progress tracking
  - Animated status updates
  - Responsive layout

- **🎫 Perfect Linear Tickets**: Auto-generated tickets include:
  - Clear, descriptive titles
  - Formatted markdown descriptions
  - Steps to reproduce
  - Environment details
  - Screenshot attachments
  - Auto-assigned labels and priority

- **⚡ Fast Processing**: Complete workflow in < 15 seconds

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │  Drag & drop screenshot
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Frontend  │  React + Vite + TailwindCSS
│  (Port 5173)│
└──────┬──────┘
       │ HTTP API
       ▼
┌─────────────┐
│   Backend   │  Express + TypeScript
│  (Port 3000)│
└──────┬──────┘
       │
       ├──► Claude Vision API (screenshot analysis)
       ├──► imgbb.com (image hosting)
       └──► Linear GraphQL API (ticket creation)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- API Keys:
  - **Anthropic API Key** (for Claude Vision)
  - **Linear API Key** (for ticket creation)
  - **imgbb API Key** (optional, for image hosting)

### Installation

```bash
# Clone or navigate to the project
cd screenshot-bug-reporter

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create `backend/.env` file:

```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key
LINEAR_API_KEY=your_linear_api_key

# Optional
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_project_id
LINEAR_TEAM_ID=your_team_id
IMGBB_API_KEY=your_imgbb_api_key

# Server config
PORT=3000
NODE_ENV=development
```

### Getting API Keys

1. **Anthropic API Key**: https://console.anthropic.com/
2. **Linear API Key**: 
   - Go to Linear Settings → API → Personal API Keys
   - Create a new key with `write` permissions
3. **imgbb API Key** (optional): https://api.imgbb.com/

### Running the Application

#### Development Mode

```bash
# Terminal 1: Start backend
cd backend
npm run build
npm start

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

#### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Build and start backend (serves frontend)
cd ../backend
npm run build
NODE_ENV=production npm start
```

Then open http://localhost:3000 in your browser.

## 📖 Usage

1. **Open the web app** at http://localhost:5173
2. **Drag and drop** a screenshot (or click to browse)
3. **Watch the magic** as AI analyzes your screenshot
4. **Get your ticket** with a direct link to Linear

### Tips for Best Results

- ✅ Include error messages in the screenshot
- ✅ Capture the browser URL bar if relevant
- ✅ Show the full error state (don't crop too much)
- ✅ Use clear, high-quality screenshots

## 🎯 API Endpoints

### `POST /api/screenshot`

Upload a screenshot for processing.

**Request:**
```bash
curl -X POST http://localhost:3000/api/screenshot \
  -F "screenshot=@/path/to/screenshot.png"
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Screenshot uploaded successfully. Processing started."
}
```

### `GET /api/screenshot/:jobId`

Get the status of a processing job.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "progress": 100,
  "currentStep": "Done!",
  "bugAnalysis": {
    "title": "Login button not responding on mobile",
    "description": "...",
    "severity": "high"
  },
  "ticketUrl": "https://linear.app/team/issue/BUG-123",
  "ticketId": "BUG-123"
}
```

### `GET /api/health`

Health check endpoint.

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web server
- **TypeScript** - Type safety
- **Anthropic SDK** - Claude Vision API
- **Sharp** - Image optimization
- **Multer** - File uploads
- **Axios** - HTTP client

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **react-dropzone** - Drag & drop

## 🔧 Troubleshooting

### "Missing required environment variable: ANTHROPIC_API_KEY"
Make sure you've created `backend/.env` with your API keys.

### "Linear API error"
- Verify your Linear API key has write permissions
- Check that your team ID is correct (or let it auto-detect)

### Images not uploading
- If imgbb fails, the app will fallback to base64 encoding
- For production, consider using S3 or Cloudinary

### Port already in use
Change the port in `backend/.env`:
```bash
PORT=3001
```

## 📝 License

MIT

## 🙏 Credits

Built with:
- [Anthropic Claude](https://www.anthropic.com/) for vision analysis
- [Linear](https://linear.app/) for issue tracking
- [imgbb](https://imgbb.com/) for image hosting

---

**Made with ❤️ for engineers, PMs, and QA who are tired of writing bug reports manually.**
