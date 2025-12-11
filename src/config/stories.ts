// Story configuration system for scalable multi-story support

export interface CharacterVoice {
  label: string;
  voice_id: string;
  description: string;
  stability?: number;
  similarity_boost?: number;
}

export interface StoryCharacter {
  id: string;
  name: string;
  avatar: string;
  color: string;
  voiceConfig: CharacterVoice;
}

export interface StoryScene {
  title: string;
  image?: string;
  component?: "forest-paths" | "pack-basket";
  description?: string;
}

export interface StoryConfig {
  id: string;
  title: string;
  author: string;
  description: string;
  duration: string;
  age: string;
  featured?: boolean;
  cover: string;
  accent: string;

  // Agent configuration
  firstMessage: string;
  storyPrompt: string;
  llm: string;
  temperature: number;

  // Characters and voices
  characters: StoryCharacter[];
  narratorVoice: CharacterVoice;

  // Scenes
  scenes: StoryScene[];

  // Educational content
  teachingObjectives?: string[];
}

// Red Riding Hood Configuration
export const redRidingHoodStory: StoryConfig = {
  id: "red-riding-hood",
  title: "Little Red Riding Hood",
  author: "Classic Tale",
  description:
    "A brave girl, a cunning wolf, and a grandmother who needs saving. Make choices that change the story.",
  duration: "15-20 min",
  age: "4-8",
  featured: true,
  cover: "from-red-500 to-rose-700",
  accent: "bg-red-500",

  firstMessage:
    "Hey there! Let's speedrun Little Red Riding Hood together! I'll tell the story super quick and we'll jump into fun activities. Ready? Let's go!",

  storyPrompt: `You are an interactive storyteller for a DEMO of Little Red Riding Hood with educational activities.

⚡ PACING RULES:
- Narrate 1-2 sentences, then WAIT for tools to complete before continuing
- After calling show_math or show_spelling, STOP and wait for the student's response
- Don't call multiple tools in rapid succession - give each one time to display
- Pause between scenes to let graphics load

TOOL CALLING SEQUENCE (IMPORTANT):
1. Call show_graphic(scene_number) → WAIT 2 seconds
2. Call change_voice(character) if character is speaking → WAIT 1 second  
3. Call show_narration(text) → WAIT until you finish speaking
4. Call show_math or show_spelling if appropriate → WAIT for student to complete
5. Move to next scene

STORY BEATS (Narrate briefly, then use tools):
1. 🏠 Scene 1: "Red's mom asks her to visit sick Grandma." → show_graphic(1) + show_narration
2. 🧺 Scene 2: "Let's pack the basket!" → show_graphic(2) [INTERACTIVE BASKET COMPONENT]
3. 🌲 Scene 3: "Into the woods!" → show_graphic(3) + show_math (easy addition)
4. 🐺 Scene 4: "A wolf appears!" → show_graphic(4) + change_voice(wolf) + show_spelling
5. 🎭 Scene 5: "Picking flowers..." → show_graphic(5)
6. 🛤️ Scene 6: "Which path?" → show_graphic(6) [INTERACTIVE PATHS COMPONENT]
7. 🌸 Scene 7: "Wolf races ahead!" → show_graphic(7)
8. 🏡 Scene 8: "Grandma's house..." → show_graphic(8) + change_voice(grandmother)
9. ⚔️ Scene 9: "Huntsman rescues them!" → show_graphic(9) + show_completion
10. 🎉 Scene 10: "Happy ending!" → show_graphic(10) + show_completion

CRITICAL RULES:
- ALWAYS call show_graphic when starting a new scene
- ALWAYS call change_voice before character dialogue
- WAIT for interactive tools (math/spelling) to complete before continuing
- Keep narration under 20 words per scene
- Use show_narration to display what you're saying

TOOL USAGE:
- show_character: Show character when they appear (wolf, grandma, etc.)
- show_narration: Keep it to 1-2 sentences max
- request_input: Brief prompts only
- show_graphic: Call this for EVERY scene transition (1-10)
- show_math: Quick easy questions (5+3=?)
- show_spelling: Short words (wolf, path, basket)
- show_completion: Celebrate quickly then move on
- change_voice: Switch voices for character dialogue

INTERACTIVE SCENES:
- Scene 2: Pack the Basket (interactive component)
- Scene 6: Choose the Path (interactive component)
- Other scenes: Quick math/spelling, then move on

CHARACTER VOICES:
When narrating dialogue, use the change_voice tool to switch voices for immersion:
- Little Red Riding Hood (innocent, young): Use "red_riding_hood" voice
- The Wolf (cunning, deep): Use "wolf" voice  
- Grandmother (elderly, warm): Use "grandmother" voice
- Narrator/Huntsman/Mother (default): Use "narrator" voice

IMPORTANT: Always call show_graphic when starting a new scene. Use show_narration to display story text. Use show_character when a character first appears. Use request_input when you want the student to speak. Use change_voice before speaking as a character.`,

  llm: "gpt-4o-mini",
  temperature: 0.7,

  narratorVoice: {
    label: "narrator",
    voice_id: "N1Hboqlv7EVe2vJJZEDX",
    description: "Default narrator voice for storytelling",
    stability: 0.5,
    similarity_boost: 0.75,
  },

  characters: [
    {
      id: "red-riding-hood",
      name: "Little Red Riding Hood",
      avatar: "🧒",
      color: "red",
      voiceConfig: {
        label: "red_riding_hood",
        voice_id: "qBxpqy1zozoVmzSgB0Rm",
        description: "Little Red Riding Hood - innocent young girl",
        stability: 0.6,
        similarity_boost: 0.8,
      },
    },
    {
      id: "wolf",
      name: "The Wolf",
      avatar: "🐺",
      color: "slate",
      voiceConfig: {
        label: "wolf",
        voice_id: "nQuulGXH8RnNTodfyvtO",
        description: "The Wolf - cunning and deep",
        stability: 0.4,
        similarity_boost: 0.7,
      },
    },
    {
      id: "grandmother",
      name: "Grandmother",
      avatar: "👵",
      color: "gray",
      voiceConfig: {
        label: "grandmother",
        voice_id: "pKiwr0RpfC2ecoUHY2AP",
        description: "Grandmother - elderly and warm",
        stability: 0.5,
        similarity_boost: 0.75,
      },
    },
  ],

  scenes: [
    { title: "Opening", image: "/scenes/opening.jpeg" },
    { title: "Pack the Basket", component: "pack-basket" },
    { title: "At Home", image: "/scenes/at_home.jpeg" },
    { title: "Into the Woods", image: "/scenes/at_home.jpeg" },
    { title: "Meeting the Wolf", image: "/scenes/at_home.jpeg" },
    { title: "Two Paths", component: "forest-paths" },
    { title: "Picking Flowers", image: "/scenes/at_home.jpeg" },
    { title: "Grandmother's House", image: "/scenes/at_home.jpeg" },
    { title: "The Rescue", image: "/scenes/at_home.jpeg" },
    { title: "Happy Ending", image: "/scenes/goodbye.jpeg" },
  ],

  teachingObjectives: [
    "Addition and subtraction",
    "Spelling common words",
    "Problem-solving skills",
    "Following instructions",
  ],
};

// Story catalog - add more stories here
export const allStories: StoryConfig[] = [
  redRidingHoodStory,
  // Add other stories as you build them
];

// Helper function to get story by ID
export function getStoryById(id: string): StoryConfig | undefined {
  return allStories.find((story) => story.id === id);
}

// Helper function to get all available stories
export function getAvailableStories(): StoryConfig[] {
  return allStories;
}
