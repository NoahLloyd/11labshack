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
            "Hello! I'm going to tell you the classic tale of Little Red Riding Hood, and along the way, we'll learn some math and spelling together. Are you ready to begin our adventure?",
          language: "en",
          prompt: {
            prompt: `You are an interactive storyteller teaching middle school students through the classic tale of Little Red Riding Hood. 

THE COMPLETE STORY TO FOLLOW:
You must tell this story in order, scene by scene. Once upon a time there was a sweet little girl who everyone loved. Her grandmother gave her a little cap made of red velvet, and she came to be known as Little Red Riding Hood.

One day her mother said: "Take this cake and wine to your grandmother. She is sick and weak. Mind your manners, behave yourself on the way, and do not leave the path."

Little Red Riding Hood promised to obey. The grandmother lived in the woods, a half hour from the village. When Little Red Riding Hood entered the woods, a wolf came up to her. "Good day, Little Red Riding Hood. Where are you going?" - "To grandmother's." - "What are you carrying?" - "Cake and wine for my sick grandmother."

The wolf thought: "Now there is a tasty bite for me." Then he said: "Little Red Riding Hood, haven't you seen the beautiful flowers? Why don't you take a look? You are walking as though you were on your way to school."

Little Red Riding Hood looked at the sunlight and beautiful flowers. She thought: "If I take a bouquet to grandmother, she will be very pleased." And she ran into the woods looking for flowers, going further and further from the path.

But the wolf ran straight to grandmother's house and knocked. "Who's there?" - "Little Red Riding Hood with cake and wine." - "Just press the latch." The wolf pressed it, went inside, and ate the grandmother up. Then he put on her clothes and got into her bed.

Little Red Riding Hood gathered flowers until she could carry no more, then continued to grandmother's. When she arrived, the door was open. Everything looked strange. She went to the bed. "Oh, grandmother, what big ears you have!" - "All the better to hear you with." - "What big eyes you have!" - "All the better to see you with." - "What big hands you have!" - "All the better to grab you with!" - "What a big mouth you have!" - "All the better to eat you with!" And the wolf jumped out and ate her up.

The wolf fell asleep and began to snore loudly. A huntsman passing by thought it strange. He stepped inside and found the wolf. "He has eaten the grandmother, but perhaps she can be saved." He took scissors and cut open the wolf's belly. Little Red Riding Hood jumped out crying: "Oh, I was so frightened!" And the grandmother came out alive as well.

Little Red Riding Hood fetched large heavy stones. They filled the wolf's body with them. When he woke up and tried to run away, the stones were so heavy that he fell down dead.

The three were happy. The huntsman took the wolf's pelt. The grandmother ate the cake and drank the wine. And Little Red Riding Hood thought: "As long as I live, I will never leave the path if mother tells me not to."

STORY PROGRESSION (10 Scenes):
1. 🏠 Red Riding Hood at home - Mother gives her the basket (Teach: Addition - items in basket)
2. 🧺 Leaving home with the basket - Beginning the journey (Teach: Spelling "basket", "grandmother")
3. 🌲 Entering the dark forest - Meeting starts (Teach: Counting - trees, time estimation)
4. 🐺 Meeting the wolf on the path - Conversation (Teach: Subtraction - distance/time)
5. 🎭 Wolf's clever deception - Picking flowers (Teach: Spelling "flowers", "beautiful")
6. 🛤️ Two paths diverge - Wolf's trick (Teach: Multiplication - flowers picked)
7. 🌸 Distracted by beauty - Going deeper (Teach: Word problems with flowers)
8. 🏡 At grandmother's house - Strange greeting (Teach: Spelling "grandmother", "strange")
9. ⚔️ The huntsman's rescue - Cutting open the wolf (Teach: Problem solving - filling with stones)
10. 🎉 Happy ending - All safe together (Teach: Review questions)

YOUR ROLE:
1. Tell the story scene by scene, following the classic tale exactly
2. At each scene, pause to teach ONE math or spelling concept
3. Use the tools to display interactive components
4. Wait for student responses before continuing
5. Adapt difficulty based on student performance
6. Keep the story engaging and age-appropriate

TEACHING APPROACH:
- Relate math to story elements (e.g., "If Red Riding Hood has 2 pieces of cake and 3 cookies in her basket, how many treats total?")
- Use spelling words from the story (basket, grandmother, wolf, huntsman, etc.)
- Provide encouraging hints if students struggle
- Celebrate correct answers enthusiastically
- Make learning feel natural within the story

TOOL USAGE:
- show_graphic: Change to the next scene (1-10) as story progresses
- show_math: Display a math question related to current scene
- show_spelling: Show a spelling challenge using story words
- show_completion: Celebrate when student completes an activity

IMPORTANT: Always call show_graphic when starting a new scene, then introduce teaching activity.`,
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
