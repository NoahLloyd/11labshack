# Red Riding Hood's Learning Adventure 🏠🐺📚

An interactive storytelling application that teaches middle school students math and spelling through the classic tale of Red Riding Hood, powered by ElevenLabs voice agents.

## Features

- **Interactive Voice Storytelling**: AI-powered voice agent narrates the story
- **Educational Activities**: Math questions and spelling challenges integrated into the narrative
- **Visual Progress**: 10 story scenes with graphics that change as the story progresses
- **Real-time Interaction**: Split-screen interface with graphics on the left and interactive teaching components on the right

## Story Scenes

1. 🏠 Red Riding Hood's house - Introduction
2. 🧺 Mother gives basket - Counting/Addition
3. 🌲 Entering the forest - Spelling practice
4. 🐺 Meeting the wolf - Subtraction
5. 🎭 Wolf's deception - Word recognition
6. 🛤️ Two paths - Division/Fractions
7. 🌸 Picking flowers - Multiplication
8. 🏡 Grandmother's house - Compound words
9. ⚔️ The rescue - Problem solving
10. 🎉 Happy ending - Review questions

## Getting Started

First, install the dependencies:

```bash
npm install
```

Set up your environment variables by creating a `.env.local` file:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

Get your API key from: https://elevenlabs.io/app/settings/api-keys

Run the development server:

````bash
npm run dev
```bash
npm run dev
````

Open [http://localhost:3000](http://localhost:3000) with your browser and click "Start Story Adventure!" to begin.

## How It Works

### ElevenLabs Agent API

The application creates an ElevenLabs conversational agent with:

- **Voice**: Rachel voice for clear, friendly narration
- **LLM**: GPT-4o-mini for intelligent conversation
- **Custom Tools**: Four client-side tools for controlling the UI:
  - `show_graphic`: Changes the story scene (1-10)
  - `show_math`: Displays math questions
  - `show_spelling`: Shows spelling challenges
  - `show_completion`: Celebrates completed activities

### Interactive Components

- **MathQuestion**: Displays math problems with hints and answer validation
- **SpellingChallenge**: Word spelling with audio playback using Web Speech API
- **CompletionMessage**: Encouraging feedback for completed activities

## Optional: Add Story Graphics

Place 10 images in the `public/` folder named `scene-1.jpg` through `scene-10.jpg`. The app will show emoji fallbacks if images aren't provided. See `public/README-GRAPHICS.md` for scene descriptions.

## Technologies Used

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **ElevenLabs Client SDK**: Voice agent integration
- **Web Speech API**: Text-to-speech for spelling words

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
