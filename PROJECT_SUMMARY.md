# Red Riding Hood Learning Adventure - Project Summary

## Overview

An interactive educational storytelling application that combines ElevenLabs voice AI with React/Next.js to teach middle school students math and spelling through the classic Red Riding Hood fairy tale.

## Key Features

### 1. Voice-Powered Storytelling

- ElevenLabs conversational AI agent narrates the Red Riding Hood story
- Interactive voice responses from students
- Natural conversation flow with educational content

### 2. Split-Screen Interface

- **Left Side**: Visual story progression through 10 animated scenes
- **Right Side**: Dynamic interactive teaching components (math, spelling, completion messages)

### 3. Educational Components

- **Math Questions**: Interactive problems with hints and instant feedback
- **Spelling Challenges**: Audio word playback with typed responses
- **Completion Messages**: Encouraging feedback animations

### 4. Story Progression

10 distinct scenes with integrated learning activities:

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

## Technical Architecture

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Voice AI**: ElevenLabs Client SDK
- **Speech**: Web Speech API (browser-based TTS)

### File Structure

```
/src
  /app
    /api
      /agent/create
        route.ts          # ElevenLabs agent creation endpoint
    page.tsx              # Main application interface
    layout.tsx
    globals.css
  /components
    MathQuestion.tsx      # Math challenge component
    SpellingChallenge.tsx # Spelling component
    CompletionMessage.tsx # Success feedback
/public
  README-GRAPHICS.md      # Instructions for adding graphics
  scene-1.jpg to scene-10.jpg (optional)
```

### API Integration

#### ElevenLabs Agent Configuration

The agent is created with:

- **Voice**: Rachel (ID: 21m00Tcm4TlvDq8ikWAM) - clear, friendly voice
- **LLM**: GPT-4o-mini for intelligent, cost-effective responses
- **Temperature**: 0.7 for creative but consistent storytelling

#### Custom Client Tools

Four tools control the UI:

1. **show_graphic** (client tool)

   - Parameters: `scene` (1-10), `description`
   - Expects response: false
   - Updates visual story scene

2. **show_math** (client tool)

   - Parameters: `question`, `answer`, `hint` (optional)
   - Expects response: true
   - Displays math problem and waits for student answer

3. **show_spelling** (client tool)

   - Parameters: `word`, `context`
   - Expects response: true
   - Shows spelling challenge with audio playback

4. **show_completion** (client tool)
   - Parameters: `message`
   - Expects response: false
   - Shows celebration message

### Agent Prompt Engineering

The agent's system prompt includes:

- Story narrative structure with 10 defined scenes
- Teaching approach guidelines (simple, encouraging, story-integrated)
- Tool usage instructions
- Scene-specific educational content mapping

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- ElevenLabs API key (from elevenlabs.io)

### Quick Start

```bash
# Run the setup script
./setup.sh

# Or manually:
npm install
cp .env.local.example .env.local
# Add your ELEVENLABS_API_KEY to .env.local

# Start development server
npm run dev
```

### Environment Variables

Required in `.env.local`:

```
ELEVENLABS_API_KEY=your_api_key_here
```

### Optional: Add Graphics

Place 10 story images in `/public`:

- scene-1.jpg through scene-10.jpg
- Fallback: Emoji icons (already implemented)

## Usage Flow

1. **Application Load**

   - Automatically creates ElevenLabs agent via API call
   - Agent ID stored in state

2. **Start Conversation**

   - User clicks "Start Story Adventure!"
   - WebSocket connection established to ElevenLabs
   - Agent speaks first message

3. **Story Interaction**

   - Agent narrates story and poses questions
   - Agent calls client tools to update UI
   - Components display and collect student responses
   - Responses sent back to agent (for expect_response tools)
   - Agent adapts story based on student performance

4. **End Session**
   - User can end story anytime
   - Conversation closes, page reloads for fresh session

## Key Implementation Details

### Tool Call Handling

```typescript
onClientToolCall: (toolCall: ClientToolCall) => {
  switch (toolCall.toolName) {
    case "show_math":
      setComponent({
        type: "math",
        props: { ...toolCall.parameters },
      });
      break;
    // ... other tools
  }
};
```

### Dynamic Component Rendering

```typescript
{
  component.type === "math" && <MathQuestion {...component.props} />;
}
{
  component.type === "spelling" && <SpellingChallenge {...component.props} />;
}
```

### Scene Progression

- Agent controls scene changes via `show_graphic` tool
- Visual progress indicator (10 dots)
- Emoji fallbacks ensure always-visible graphics

## Customization Options

### Change the Story

Edit the agent prompt in `/src/app/api/agent/create/route.ts`

### Use Different Voice

Update `voice_id` in agent config (browse ElevenLabs voice library)

### Add More Activities

1. Create new component in `/components`
2. Add tool definition to agent config
3. Handle tool call in `handleToolCall` function

### Adjust Difficulty

Modify the agent prompt to target different grade levels

## Deployment Considerations

### Vercel (Recommended)

```bash
vercel deploy
```

Add `ELEVENLABS_API_KEY` to environment variables in Vercel dashboard

### Other Platforms

- Ensure Node.js 18+ runtime
- Set environment variables
- Build command: `npm run build`
- Start command: `npm start`

## Cost Considerations

### ElevenLabs Usage

- Conversational AI pricing applies
- Voice synthesis charged per character
- Recommend setting usage limits in ElevenLabs dashboard

### LLM Costs

- GPT-4o-mini is cost-effective for this use case
- Alternative: Use gemini-1.5-flash or claude-haiku-4-5 for lower costs

## Future Enhancements

### Potential Features

- [ ] Multiple story options (other fairy tales)
- [ ] Progress tracking and student profiles
- [ ] Teacher dashboard with analytics
- [ ] Difficulty auto-adjustment based on performance
- [ ] Multilingual support
- [ ] Voice cloning for parent narration
- [ ] Save/resume story sessions
- [ ] Printable activity worksheets

### Technical Improvements

- [ ] Add unit tests
- [ ] Implement error boundaries
- [ ] Add loading skeletons
- [ ] Optimize bundle size
- [ ] Add PWA support for offline story mode
- [ ] Implement analytics tracking

## Troubleshooting

### Agent Creation Fails

- Verify API key is correct
- Check ElevenLabs account has credits
- Ensure network connectivity

### No Audio

- Check browser microphone permissions
- Verify speakers/headphones connected
- Test with different browser

### Tools Not Working

- Check browser console for errors
- Verify tool names match exactly
- Ensure onClientToolCall is properly configured

### Slow Performance

- ElevenLabs API latency can vary
- Consider using faster LLM (gemini-2.0-flash)
- Optimize component re-renders

## License

MIT

## Credits

Built for ElevenLabs Hackathon
Uses ElevenLabs Conversational AI Platform
Powered by Next.js and React
