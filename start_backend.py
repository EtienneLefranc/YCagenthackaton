#!/usr/bin/env python3
"""
Startup script for the GlowUp Market Research Backend
This script helps users start the Flask backend service
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_python_dependencies():
    """Check if required Python packages are installed"""
    required_packages = ['flask', 'flask-cors', 'requests', 'python-dotenv']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing required packages: {', '.join(missing_packages)}")
        print("Please install them using: pip install " + " ".join(missing_packages))
        return False
    
    print("✅ All required Python packages are installed")
    return True

def check_ollama():
    """Check if Ollama is running"""
    try:
        import requests
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama is running")
            return True
        else:
            print("⚠️  Ollama is not responding properly")
            return False
    except:
        print("⚠️  Ollama is not running (this is optional - will use fallback questions)")
        return False

def start_backend():
    """Start the Flask backend"""
    print("\n🚀 Starting GlowUp Market Research Backend...")
    
    # Change to the GlowUp directory
    glowup_dir = Path(__file__).parent / "GlowUp"
    if not glowup_dir.exists():
        print("❌ GlowUp directory not found. Please make sure you're in the right location.")
        return False
    
    os.chdir(glowup_dir)
    
    # Check if config.env exists, if not create from template
    if not Path("config.env").exists() and Path("config.env.template").exists():
        print("📝 Creating config.env from template...")
        with open("config.env.template", "r") as template:
            content = template.read()
        with open("config.env", "w") as config:
            config.write(content)
        print("⚠️  Please edit config.env and add your Anthropic API key")
    
    # Start the Flask app
    try:
        print("🌐 Backend will be available at: http://localhost:5001")
        print("📊 Health check: http://localhost:5001/api/health")
        print("🔍 Ollama status: http://localhost:5001/api/ollama-status")
        print("\nPress Ctrl+C to stop the backend\n")
        
        subprocess.run([sys.executable, "app.py"])
        
    except KeyboardInterrupt:
        print("\n\n🛑 Backend stopped by user")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False
    
    return True

def main():
    """Main function"""
    print("🎯 GlowUp Market Research Backend Startup")
    print("=" * 50)
    
    # Check dependencies
    if not check_python_dependencies():
        sys.exit(1)
    
    # Check Ollama (optional)
    check_ollama()
    
    # Start backend
    if start_backend():
        print("✅ Backend startup completed successfully")
    else:
        print("❌ Backend startup failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
