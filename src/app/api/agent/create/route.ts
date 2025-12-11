import { NextResponse } from "next/server";
import { getStoryById } from "@/config/stories";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    // Get story ID from request body
    const { storyId } = await request.json();

    if (!storyId) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 }
      );
    }

    // Load story configuration
    const storyConfig = getStoryById(storyId);

    if (!storyConfig) {
      return NextResponse.json(
        { error: `Story not found: ${storyId}` },
        { status: 404 }
      );
    }

    console.log(`Creating agent for story: ${storyConfig.title}`);

    // Build supported_voices array from story config
    const supportedVoices = [
      storyConfig.narratorVoice,
      ...storyConfig.characters.map((char) => char.voiceConfig),
    ];

    const agentConfig = {
      conversation_config: {
        agent: {
          first_message: storyConfig.firstMessage,
          language: "en",
          prompt: {
            prompt: storyConfig.storyPrompt,
            llm: storyConfig.llm,
            temperature: storyConfig.temperature,
            tools: [
              {
                type: "client",
                name: "show_character",
                description:
                  "Make a character avatar visible when they first appear in the story. Call this the first time Red Riding Hood, Grandmother, or the Wolf appear.",
                parameters: {
                  type: "object",
                  properties: {
                    character: {
                      type: "string",
                      enum: ["red-riding-hood", "grandmother", "wolf"],
                      description: "The character that is appearing",
                    },
                  },
                  required: ["character"],
                },
                expects_response: false,
              },
              {
                type: "client",
                name: "show_narration",
                description:
                  "Display story text on screen as you narrate it. Use this to show what you are saying so students can read along.",
                parameters: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string",
                      description: "The narration text to display",
                    },
                    speaker: {
                      type: "string",
                      enum: [
                        "narrator",
                        "red-riding-hood",
                        "grandmother",
                        "wolf",
                      ],
                      description: "Who is speaking (defaults to narrator)",
                    },
                  },
                  required: ["text"],
                },
                expects_response: false,
              },
              {
                type: "client",
                name: "request_input",
                description:
                  "Ask the user for voice input. They will need to hold down the spacebar to speak. Use this when you want them to make a choice or answer a question.",
                parameters: {
                  type: "object",
                  properties: {
                    prompt: {
                      type: "string",
                      description: "The question or prompt for the user",
                    },
                  },
                  required: ["prompt"],
                },
                expects_response: false,
              },
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
              {
                type: "client",
                name: "change_voice",
                description:
                  "Change the narrator voice to match the character who is speaking. Use this before speaking dialogue to make the story more immersive.",
                parameters: {
                  type: "object",
                  properties: {
                    character: {
                      type: "string",
                      enum: [
                        "narrator",
                        "red_riding_hood",
                        "wolf",
                        "grandmother",
                      ],
                      description:
                        "Which character is about to speak: narrator (default/huntsman/mother), red_riding_hood (young girl), wolf (cunning antagonist), grandmother (elderly woman)",
                    },
                  },
                  required: ["character"],
                },
                expects_response: false,
              },
            ],
          },
        },
        tts: {
          voice_id: storyConfig.narratorVoice.voice_id,
          model_id: "eleven_turbo_v2",
          stability: storyConfig.narratorVoice.stability || 0.5,
          similarity_boost: storyConfig.narratorVoice.similarity_boost || 0.75,
          supported_voices: supportedVoices,
        },
      },
      name: `${storyConfig.title} Teacher`,
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
