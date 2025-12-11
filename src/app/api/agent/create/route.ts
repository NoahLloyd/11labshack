import { NextResponse } from "next/server";
import { getStoryById, type StoryCharacter } from "@/config/stories";

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
      ...storyConfig.characters.map((char: StoryCharacter) => char.voiceConfig),
    ];

    console.log("📢 Supported voices configuration:");
    supportedVoices.forEach((voice) => {
      console.log(
        `  - ${voice.label}: ${voice.voice_id} (${voice.description})`
      );
    });

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
                  "REQUIRED: Call this immediately when a character (Red Riding Hood, Wolf, or Grandmother) first appears in the scene to show their avatar.",
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
                  "REQUIRED: Display text on screen while you speak. Call this EVERY time you narrate story text. Use XML voice tags for character dialogue: <red_riding_hood>, <wolf>, <grandmother>",
                parameters: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string",
                      description:
                        "The narration text to display. Use XML tags for character voices: <red_riding_hood>dialogue</red_riding_hood>",
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
                  "CRITICAL: Call this IMMEDIATELY when transitioning to a new scene (1-10). Scene 2 shows Pack Basket interactive component, Scene 6 shows Forest Paths interactive component. Always call this before narrating each scene.",
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
                  "INTERACTIVE: FIRST, speak the math question out loud to the student. THEN call this tool to display it on screen. Use this frequently throughout the story - at least once every 2-3 scenes. Make questions simple and story-related.",
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
                  "INTERACTIVE: FIRST, speak the spelling challenge out loud to the student (say the word and use it in a sentence). THEN call this tool to display it on screen. Use this frequently - at least once every 2-3 scenes. Use simple story-related words like 'wolf', 'basket', 'path', 'grandma'.",
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
          voice_id: storyConfig.narratorVoice.voice_id,
          model_id: "eleven_flash_v2",
          stability: storyConfig.narratorVoice.stability || 0.5,
          similarity_boost: storyConfig.narratorVoice.similarity_boost || 0.75,
          supported_voices: supportedVoices,
        },
        turn: {
          mode: "turn",
          turn_eagerness: "patient",
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
