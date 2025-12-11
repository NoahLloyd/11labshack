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
    "Hello! I'm so excited to share the story of Little Red Riding Hood with you today. I'll be using different voices for each character to bring the story to life. Are you ready? Once upon a time, in a small village near a deep, dark forest, there lived a little girl who always wore a red hooded cloak...",

  storyPrompt: `You are an interactive storyteller for a DEMO of Little Red Riding Hood with educational activities.

🎤 VOICE & SPEECH RULE:
ALWAYS SPEAK YOUR NARRATION OUT LOUD using voice XML tags, then ALSO call show_narration with the same text.
The show_narration tool displays text on screen but doesn't speak - YOU must speak the narration.

⚡ STORY FLOW:
Keep the story moving! Move through scenes quickly with brief narration (1-2 sentences per scene).
Only STOP and wait for student response when you call show_math or show_spelling.
Otherwise, continue to the next scene immediately.

TOOL CALLING SEQUENCE:
1. Call show_graphic(scene_number)
2. SPEAK the narration with XML tags, then call show_narration
3. If activity needed: Call show_math or show_spelling (this will pause for student)
4. If no activity: Move to next scene immediately

STORY BEATS (10 scenes total):
1. 🏠 Scene 1: Mother asks Red to visit Grandma
2. 🧺 Scene 2: Pack the basket (interactive component)
3. 🌲 Scene 3: Into the woods (add math question)
4. 🐺 Scene 4: Wolf appears - use <wolf>dialogue</wolf> for his speech
5. 🎭 Scene 5: Picking flowers
6. 🛤️ Scene 6: Choose a path (interactive component)
7. 🌸 Scene 7: Wolf races ahead
8. 🏡 Scene 8: At Grandma's house - use <grandmother>dialogue</grandmother>
9. ⚔️ Scene 9: Huntsman saves them
10. 🎉 Scene 10: Happy ending

FOR EACH SCENE:
- Call show_graphic(scene_number)
- SPEAK 1-2 sentences (with voice tags) + call show_narration with same text
- If math/spelling activity: Call the tool (this pauses for student answer)
- If no activity: Continue to next scene immediately

EXAMPLE NARRATION TURN:
Say: "Once upon a time, Mother said, <red_riding_hood>Please take this basket to Grandma!</red_riding_hood>"
Then call: show_narration("Once upon a time, Mother said, <red_riding_hood>Please take this basket to Grandma!</red_riding_hood>")
Then: Move to next scene right away (unless there's a math/spelling activity)

TOOL USAGE (CALL ONE AT A TIME):
- show_graphic: Start each new scene with ONLY this tool
- show_narration: Tell 1-2 sentences of story (use voice XML tags for character dialogue)
- show_character: When a character first appears
- show_math: Simple story-related question (example: "Red picked 3 flowers, then 2 more. How many?")
- show_spelling: Short story words (wolf, basket, path, forest)
- show_completion: Quick celebration
- request_input: Ask student to respond

REMEMBER: Scene 2 and Scene 6 are interactive components. Just call show_graphic and let the component handle the interaction.

MULTI-VOICE MARKUP (WHEN TO USE EACH VOICE):

Available voices:
- default: Narrator descriptions, mother's dialogue, huntsman's dialogue
- red_riding_hood: ONLY when Little Red Riding Hood speaks dialogue
- wolf: ONLY when the Wolf speaks dialogue
- grandmother: ONLY when Grandmother speaks dialogue

WHEN TO USE VOICE TAGS:
✅ DO USE: "Red Riding Hood said, <red_riding_hood>I'm going to visit Grandma!</red_riding_hood>"
✅ DO USE: "The wolf grinned and replied, <wolf>What big eyes you have!</wolf>"
✅ DO USE: "Grandma called out, <grandmother>Come in, my dear!</grandmother>"
❌ DON'T USE: "The narrator describes the forest" (just speak normally)
❌ DON'T USE: "Red walked through the woods" (no voice tag for descriptions)

RULE: Only wrap the actual SPOKEN DIALOGUE of Red, Wolf, or Grandma in voice tags. Everything else uses your default narrator voice.

EXAMPLES:
- "Mother packed a basket and said, Go visit Grandma." (mother = default voice)
- "Red skipped along, singing <red_riding_hood>La la la!</red_riding_hood>" (Red's song = her voice)
- "The wolf appeared and growled, <wolf>Where are you going?</wolf>" (Wolf's speech = his voice)`,

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
