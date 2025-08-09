# 🚀 GlowUp Market Research Integration

This project now integrates the Landing page input with AI-powered market research question generation and comprehensive report creation.

## ✨ Features

- **Problem Statement Input**: Users can describe their business problem on the Landing page
- **AI Question Generation**: Uses Ollama (local LLM) to generate intelligent market research questions
- **Market Research Reports**: Generates comprehensive reports using Anthropic Claude API
- **Fallback System**: Works even without Ollama running

## 🏗️ Architecture

```
Frontend (React) ←→ Python Backend (Flask) ←→ Ollama (Local LLM)
                              ↓
                    Anthropic Claude API
```

## 🚀 Quick Start

### 1. Start the Python Backend

```bash
# Option 1: Use the startup script
python start_backend.py

# Option 2: Manual start
cd GlowUp
python app.py
```

The backend will run on `http://localhost:5001`

### 2. Start the React Frontend

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Configure API Keys (Optional)

If you want to use the full market research report generation:

1. Copy `GlowUp/config.env.template` to `GlowUp/config.env`
2. Add your Anthropic API key to `config.env`:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

## 🔧 How It Works

### 1. Problem Statement Input
- Users enter their business problem on the Landing page
- The input is sent to the Python backend

### 2. Question Generation
- Backend uses Ollama (local LLM) to generate intelligent questions
- If Ollama is unavailable, falls back to predefined questions
- Questions are returned to the frontend and displayed

### 3. Market Research Reports (Optional)
- Users can answer the generated questions
- Answers are sent to the backend
- Backend uses Anthropic Claude to generate comprehensive reports

## 📡 API Endpoints

### Question Generation
```
POST /api/generate-questions
Body: {"problem_statement": "your problem here"}
```

### Report Generation
```
POST /api/generate-report
Body: {
  "problem_statement": "your problem",
  "user_answers": [{"question": "Q1", "answer": "A1"}]
}
```

### Health Check
```
GET /api/health
```

### Ollama Status
```
GET /api/ollama-status
```

## 🛠️ Dependencies

### Python Backend
- Flask
- Flask-CORS
- Requests
- Python-dotenv

### Frontend
- React
- Framer Motion
- Tailwind CSS

## 🔍 Troubleshooting

### Backend Won't Start
1. Check if Python dependencies are installed: `pip install flask flask-cors requests python-dotenv`
2. Ensure you're in the correct directory
3. Check if port 5001 is available

### Ollama Issues
1. Install Ollama: https://ollama.ai/
2. Start Ollama service
3. The system will work with fallback questions if Ollama is unavailable

### API Connection Issues
1. Ensure backend is running on port 5001
2. Check CORS settings
3. Verify network connectivity

## 📱 Usage Flow

1. **Landing Page**: User enters business problem
2. **Question Generation**: AI generates relevant market research questions
3. **Question Display**: Questions are shown to user with options
4. **Answer Collection**: User provides answers (can be implemented in next phase)
5. **Report Generation**: AI generates comprehensive market research report

## 🎯 Next Steps

- [ ] Implement answer collection interface
- [ ] Add report display component
- [ ] Create question editing capabilities
- [ ] Add export functionality for reports
- [ ] Implement user authentication
- [ ] Add question templates for different industries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the integration
5. Submit a pull request

## 📄 License

This project is part of the YC Agent Hackathon.
