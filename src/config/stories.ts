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
  image: string;
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
    "Hello! I'm going to tell you the classic tale of Little Red Riding Hood, and along the way, we'll learn some math and spelling together. Are you ready to begin our adventure?",

  storyPrompt: `You are an interactive storyteller teaching middle school students through the classic tale of Little Red Riding Hood. 

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
- show_character: Make a character avatar visible when they first appear in the story
- show_narration: Display story text on screen as you narrate it
- request_input: Ask the user for voice input (they hold spacebar to speak)
- show_graphic: Change to the next scene (1-10) as story progresses
- show_math: Display a math question related to current scene
- show_spelling: Show a spelling challenge using story words
- show_completion: Celebrate when student completes an activity
- change_voice: Switch the narrator voice to match the character speaking

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
    voice_id: "C13TXGSBliSQfV3318s8",
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
        voice_id: "uNX8xsOx2EBjgaerCsRt",
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
        voice_id: "zt3hcTSXa6Wt6GbOg5Ho",
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
        voice_id: "ueNx3ohiKrOvUObXedKm",
        description: "Grandmother - elderly and warm",
        stability: 0.5,
        similarity_boost: 0.75,
      },
    },
  ],

  scenes: [
    { title: "Home", image: "/scenes/1.png" },
    { title: "The Basket", image: "/scenes/2.png" },
    { title: "Into the Woods", image: "/scenes/3.png" },
    { title: "The Wolf", image: "/scenes/4.png" },
    { title: "A Trick", image: "/scenes/5.png" },
    { title: "Two Paths", image: "/scenes/6.png" },
    { title: "Flowers", image: "/scenes/7.png" },
    { title: "Grandmother's", image: "/scenes/8.png" },
    { title: "The Rescue", image: "/scenes/9.png" },
    { title: "The End", image: "/scenes/10.png" },
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
