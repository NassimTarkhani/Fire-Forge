#!/bin/bash
# Quick start script for Linux/Mac

echo "========================================"
echo "FireForge - Quick Start"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment"
        exit 1
    fi
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env"
echo "2. Configure your .env file with Supabase and Firecrawl settings"
echo "3. Run the database schema in Supabase (schema.sql)"
echo "4. Start the server with: uvicorn app.main:app --reload"
echo ""
echo "For more information, see README.md"
echo "========================================"
