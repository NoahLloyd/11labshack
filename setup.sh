#!/bin/bash

# Red Riding Hood Learning Adventure Setup Script

echo "🏠 Setting up Red Riding Hood's Learning Adventure..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cp .env.local.example .env.local
    echo "⚠️  Please edit .env.local and add your ELEVENLABS_API_KEY"
    echo "   Get your API key from: https://elevenlabs.io/app/settings/api-keys"
    echo ""
else
    echo "✓ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Add your ElevenLabs API key to .env.local"
echo "  2. Run: npm run dev"
echo "  3. Open http://localhost:3000"
echo ""
echo "Optional: Add story graphics (scene-1.jpg through scene-10.jpg) to the public/ folder"
echo ""
