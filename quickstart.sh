#!/bin/bash

# Vinly Quick Start Script
# This script helps you get started with Vinly development quickly

echo "🍷 Welcome to Vinly Setup"
echo "========================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo "✅ Node.js found: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "   Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "   Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "   Installing Python dependencies..."
pip install -q -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
    echo "   ⚠️  Please edit backend/.env with your credentials!"
fi

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend

# Install dependencies
echo "   Installing Node.js dependencies..."
npm install --silent

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "   Creating .env.local file..."
    cp .env.example .env.local
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Edit backend/.env with your MongoDB URI, OpenAI API key, and Instagram credentials"
echo "   2. Edit backend/scripts/seed_influencers.py with real Dutch wine influencer handles"
echo "   3. Run: cd backend && python scripts/seed_influencers.py"
echo ""
echo "🚀 To start development servers:"
echo ""
echo "   Backend (in one terminal):"
echo "   $ cd backend"
echo "   $ source venv/bin/activate"
echo "   $ uvicorn app.main:app --reload"
echo ""
echo "   Frontend (in another terminal):"
echo "   $ cd frontend"
echo "   $ npm run dev"
echo ""
echo "   Then visit: http://localhost:5173"
echo ""
echo "📚 For deployment instructions, see DEPLOYMENT.md"
echo ""

