#!/bin/bash
# Docker development helper script for Vinly
# Makes it easy to start the development environment

set -e

echo "🍷 Vinly Wine Discovery Platform - Docker Development"
echo "======================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file"
        echo ""
        echo "⚠️  IMPORTANT: Edit .env and add your OPENAI_API_KEY"
        echo ""
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Check if OPENAI_API_KEY is set
if ! grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo "⚠️  WARNING: OPENAI_API_KEY not configured in .env"
    echo "Get your API key from: https://platform.openai.com/api-keys"
    echo ""
fi

# Parse command line arguments
PROFILE=""
if [ "$1" == "--with-tools" ]; then
    PROFILE="--profile tools"
    echo "🛠️  Starting with database tools (Mongo Express)..."
else
    echo "💡 Tip: Use --with-tools to start Mongo Express (database UI)"
fi

echo ""
echo "🚀 Starting Docker containers..."
echo ""

# Start Docker Compose
docker-compose $PROFILE up --build

echo ""
echo "👋 Shutting down..."

