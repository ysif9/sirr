# Setup Ollama for Windows

## 🔧 Installation

### Download and Install Ollama

1. **Download Ollama for Windows:**
    - Visit the official Ollama website: [https://ollama.com/download](https://ollama.com/download)
    - Click on **"Download for Windows"**
    - Download the `OllamaSetup.exe` file

2. **Install Ollama:**
   ```cmd
   # Run the downloaded installer as Administrator
   # Follow the installation wizard (default settings are recommended)
   ```

3. **Verify Installation:**
   ```cmd
   # Open Command Prompt or PowerShell and run:
   ollama --version
   ```
   You should see output like: `ollama version is 0.x.x`

4. **Set model download directory (optional)**
   - See the official [documentation](https://github.com/ollama/ollama/blob/main/docs/faq.md#where-are-models-stored) 

## 🤖 Model Setup

### Download Required Model

This project specifically uses the **Gemma 3 4B** model. Download and set it up:

```cmd
# Pull the Gemma 3 4B model (this may take several minutes)
ollama pull gemma3:4b

# Verify the model is installed
ollama list
```

### Test Model

```cmd
# Test the model is working correctly
ollama run gemma3:4b
```

You should receive a response from the model. Press `Ctrl+D` or type `/bye` to exit the chat.

## ⚙️ Configuration

### Environment Variables

1. **Copy the environment template:**
   ```cmd
   cp .env.example .env
   ```

2. **Configure Ollama settings in `.env`:**
   ```env
   # Ollama Settings (for local Windows development)
   OLLAMA_PATH=C:\Users\%USERNAME%\.ollama
   ```

## 🐳 Docker Integration

If you're using Docker Compose (recommended for full development):

- You can run `poe devlm` instead of `poe dev` to start the development server with Ollama.

