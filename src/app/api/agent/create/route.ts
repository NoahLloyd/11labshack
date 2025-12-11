import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const agentConfig = {
      conversation_config: {
        agent: {
          first_message:
            "Hello! I'm going to tell you an exciting story about Red Riding Hood, and along the way, we'll learn some math and spelling together. Are you ready to begin our adventure?",
          language: "en",
          prompt: {
            prompt: `You are an interactive storyteller teaching middle school students through the story of Red Riding Hood. 

Your role is to:
1. Tell the Red Riding Hood story in an engaging, age-appropriate way
2. Pause at key moments to teach math and spelling concepts
3. Use the available tools to display interactive components on screen
4. Progress through 10 story scenes (graphics 1-10)

STORY PROGRESSION:
- Scene 1: Red Riding Hood's house - Introduction
- Scene 2: Mother gives basket - Teach counting/addition
- Scene 3: Entering the forest - Spelling practice
- Scene 4: Meeting the wolf - Subtraction
- Scene 5: Wolf's deception - Word recognition
- Scene 6: Two paths - Division/fractions
- Scene 7: Picking flowers - Multiplication
- Scene 8: Grandmother's house - Spelling compound words
- Scene 9: The rescue - Problem solving
- Scene 10: Happy ending - Review questions

TEACHING APPROACH:
- Keep explanations simple and encouraging
- Relate math to the story (e.g., "Red Riding Hood has 3 apples and 2 oranges, how many fruits total?")
- Use spelling words from the story
- Wait for student responses before continuing
- Provide hints if they struggle
- Celebrate correct answers enthusiastically

TOOL USAGE:
Use these tools to display interactive components:
- show_graphic: Change the story graphic (pass scene number 1-10)
- show_math: Display a math question (pass problem text and answer)
- show_spelling: Display a spelling challenge (pass word to spell)
- show_completion: Mark an activity as complete

Always explain why you're showing a component before calling the tool.`,
            llm: "gpt-4o-mini",
            temperature: 0.7,
            tools: [
              {
                type: "client",
                name: "show_graphic",
                description:
                  "Display a story scene graphic. Use this to progress through the visual story (scenes 1-10).",
                parameters: {
                  type: "object",
                  properties: {
                    scene: {
                      type: "number",
                      description: "Scene number from 1 to 10",
                    },
                    description: {
                      type: "string",
                      description:
                        "Brief description of what's happening in this scene",
                    },
                  },
                  required: ["scene", "description"],
                },
                expects_response: false,
              },
              {
                type: "client",
                name: "show_math",
                description:
                  "Display an interactive math question for the student to solve.",
                parameters: {
                  type: "object",
                  properties: {
                    question: {
                      type: "string",
                      description: "The math question to display",
                    },
                    answer: {
                      type: "number",
                      description: "The correct answer (used for validation)",
                    },
                    hint: {
                      type: "string",
                      description: "Optional hint to help the student",
                    },
                  },
                  required: ["question", "answer"],
                },
                expects_response: true,
              },
              {
                type: "client",
                name: "show_spelling",
                description:
                  "Display a spelling challenge for a word from the story.",
                parameters: {
                  type: "object",
                  properties: {
                    word: {
                      type: "string",
                      description: "The word the student should spell",
                    },
                    context: {
                      type: "string",
                      description: "Use the word in a sentence for context",
                    },
                  },
                  required: ["word", "context"],
                },
                expects_response: true,
              },
              {
                type: "client",
                name: "show_completion",
                description:
                  "Show a completion message when an activity is successfully completed.",
                parameters: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      description: "Encouraging completion message",
                    },
                  },
                  required: ["message"],
                },
                expects_response: false,
              },
            ],
          },
        },
        tts: {
          voice_id: "21m00Tcm4TlvDq8ikWAM", // Rachel voice - clear and friendly
          model_id: "eleven_turbo_v2_5",
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      name: "Red Riding Hood Teacher",
      tags: ["education", "storytelling", "middle-school"],
    };

    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/agents/create",
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentConfig),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ElevenLabs API error:", errorData);
      return NextResponse.json(
        { error: "Failed to create agent", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
