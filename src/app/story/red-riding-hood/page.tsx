"use client";

import { useState, useEffect, useRef } from "react";
import { Conversation } from "@elevenlabs/client";
import { ArrowLeft, Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MathQuestion from "@/components/MathQuestion";
import SpellingChallenge from "@/components/SpellingChallenge";
import CompletionMessage from "@/components/CompletionMessage";
import ForestPaths from "@/components/ForestPaths";
import PackBasket from "@/components/PackBasket";
import { getStoryById } from "@/config/stories";

type InteractiveComponent = {
  type: "math" | "spelling" | "completion" | null;
  props?: Record<string, unknown>;
};

type CharacterId =
  | "red-riding-hood"
  | "grandmother"
  | "wolf"
  | "hunter"
  | "owl";
type Speaker = "narrator" | CharacterId;

interface CharacterConfig {
  name: string;
  png: string;
  webm: string;
  fallbackEmoji: string;
}

const characters: Record<CharacterId, CharacterConfig> = {
  "red-riding-hood": {
    name: "Red Riding Hood",
    png: "/avatars/png/Red riding hood.png",
    webm: "/avatars/animated/Red Riding Hen animation-no-bg.webm",
    fallbackEmoji: "🧒",
  },
  grandmother: {
    name: "Grandma",
    png: "/avatars/png/Grandma.png",
    webm: "/avatars/animated/Grandma animation-no-bg.webm",
    fallbackEmoji: "👵",
  },
  wolf: {
    name: "Wolf",
    png: "/avatars/png/wolf.png",
    webm: "/avatars/animated/Wolf animation-no-bg.webm",
    fallbackEmoji: "🐺",
  },
  hunter: {
    name: "Hunter",
    png: "/avatars/png/Hunter.png",
    webm: "/avatars/animated/Hunter animation -no-bg.webm",
    fallbackEmoji: "🪓",
  },
  owl: {
    name: "Owl",
    png: "/avatars/png/OWL.png",
    webm: "/avatars/animated/Narrator OWL animation.webm",
    fallbackEmoji: "🦉",
  },
};

// Load scenes from story configuration
const storyConfig = getStoryById("red-riding-hood");
const scenes = storyConfig?.scenes || [];

// Avatar list for display (derived from characters)
const avatarList = Object.values(characters);

// Map backend voice names to frontend CharacterIds
const voiceToCharacter: Record<string, CharacterId | "narrator"> = {
  narrator: "owl",
  red_riding_hood: "red-riding-hood",
  wolf: "wolf",
  grandmother: "grandmother",
};

export default function RedRidingHoodStory() {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentScene, setCurrentScene] = useState(1);
  const [hasPermission, setHasPermission] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [component, setComponent] = useState<InteractiveComponent>({
    type: null,
  });

  // Character avatar state
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker>("narrator");
  const [appearedCharacters, setAppearedCharacters] = useState<
    Set<CharacterId>
  >(new Set());
  const [storyText, setStoryText] = useState<string>("");
  const [isAwaitingInput, setIsAwaitingInput] = useState(false);
  const [isHoldingSpacebar, setIsHoldingSpacebar] = useState(false);
  const [isAnimatedMode, setIsAnimatedMode] = useState(false);

  const conversationRef = useRef<Conversation | null>(null);

  useEffect(() => {
    createAgent();
    checkMicrophonePermission();
  }, []);

  // Spacebar event listener for push-to-talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && isAwaitingInput && !isHoldingSpacebar) {
        e.preventDefault();
        setIsHoldingSpacebar(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && isHoldingSpacebar) {
        e.preventDefault();
        setIsHoldingSpacebar(false);
        setIsAwaitingInput(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isAwaitingInput, isHoldingSpacebar]);

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      setHasPermission(result.state === "granted");
      if (result.state === "prompt") {
        setShowPermissionPrompt(true);
      }
    } catch {
      console.log("Permission API not supported, will request on start");
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      setShowPermissionPrompt(false);
    } catch {
      setError(
        "Microphone access is required for voice interaction. Please enable it in your browser settings."
      );
    }
  };

  const createAgent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/agent/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: "red-riding-hood" }),
      });
      if (!response.ok) throw new Error("Failed to create agent");
      const data = await response.json();
      setAgentId(data.agent_id);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create agent");
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async () => {
    if (!agentId) return;
    try {
      setIsLoading(true);
      const conv = await Conversation.startSession({
        agentId,
        connectionType: "websocket",
        onConnect: () => {
          console.log("Connected to agent");
          setIsConnected(true);
        },
        onDisconnect: () => {
          console.log("Disconnected from agent");
          setIsConnected(false);
        },
        onError: (error: string) => {
          console.error("Conversation error:", error);
          setError("Connection error");
        },
        onMessage: (message: string) => {
          console.log("Message received:", message);
        },
        onModeChange: (mode: { mode: string }) => {
          console.log("Mode changed:", mode);
          setIsSpeaking(mode.mode === "speaking");
        },
        clientTools: {
          show_character: (parameters: { character: string }) => {
            console.log("🎭 [TOOL] show_character called:", parameters);
            const charId = parameters.character as CharacterId;
            if (charId && characters[charId]) {
              setAppearedCharacters((prev) => {
                const newSet = new Set(prev).add(charId);
                console.log("✅ Character appeared:", charId, "All:", Array.from(newSet));
                return newSet;
              });
            } else {
              console.warn("⚠️ Unknown character ID:", charId);
            }
          },
          show_narration: (parameters: { text: string; speaker?: string }) => {
            console.log("📖 [TOOL] show_narration called:", {
              text: parameters.text.substring(0, 50) + "...",
              speaker: parameters.speaker,
            });
            setStoryText(parameters.text);
            if (parameters.speaker) {
              console.log("🗣️ Setting speaker to:", parameters.speaker);
              setCurrentSpeaker(parameters.speaker as Speaker);
            }
            setComponent({ type: null });
            setIsAwaitingInput(false);
          },
          request_input: (parameters: { prompt: string }) => {
            console.log("request_input called:", parameters);
            setStoryText(parameters.prompt);
            setIsAwaitingInput(true);
            setComponent({ type: null });
          },
          show_graphic: (parameters: { scene: number; description?: string }) => {
            console.log("🎬 [TOOL] show_graphic called:", parameters);
            const sceneNum = parameters.scene || 1;
            console.log(`📍 Transitioning to Scene ${sceneNum}/10:`, scenes[sceneNum - 1]?.title);
            setCurrentScene(sceneNum);
          },
          show_math: async (parameters: {
            question: string;
            answer: number;
            hint?: string;
          }) => {
            console.log("🔢 [TOOL] show_math called:", parameters);
            return new Promise<string>((resolve) => {
              setComponent({
                type: "math",
                props: {
                  question: parameters.question,
                  answer: parameters.answer,
                  hint: parameters.hint,
                  onComplete: (correct: boolean) => {
                    console.log("✅ Math completed:", correct ? "CORRECT" : "INCORRECT");
                    setComponent({ type: null });
                    resolve(JSON.stringify({ correct }));
                  },
                },
              });
            });
          },
          show_spelling: async (parameters: {
            word: string;
            context: string;
          }) => {
            console.log("🔤 [TOOL] show_spelling called:", parameters);
            return new Promise<string>((resolve) => {
              setComponent({
                type: "spelling",
                props: {
                  word: parameters.word,
                  context: parameters.context,
                  onComplete: (correct: boolean) => {
                    console.log("✅ Spelling completed:", correct ? "CORRECT" : "INCORRECT");
                    setComponent({ type: null });
                    resolve(JSON.stringify({ correct }));
                  },
                },
              });
            });
          },
          show_completion: (parameters: { message: string }) => {
            console.log("show_completion called:", parameters);
            setComponent({
              type: "completion",
              props: { message: parameters.message },
            });
            setTimeout(() => setComponent({ type: null }), 3000);
          },
          change_voice: (parameters: { character: string }) => {
            console.log("🎤 [TOOL] change_voice called:", parameters);
            const voiceChar = parameters.character;

            // Map voice labels to display characters
            if (voiceChar === "narrator") {
              console.log("🦉 Switching to NARRATOR voice");
              setCurrentSpeaker("narrator");
              setIsAnimatedMode(true);
            } else if (voiceChar === "red_riding_hood") {
              console.log("👧 Switching to RED RIDING HOOD voice");
              setCurrentSpeaker("red-riding-hood");
              setIsAnimatedMode(true);
              setAppearedCharacters((prev) => new Set(prev).add("red-riding-hood"));
            } else if (voiceChar === "wolf") {
              console.log("🐺 Switching to WOLF voice");
              setCurrentSpeaker("wolf");
              setIsAnimatedMode(true);
              setAppearedCharacters((prev) => new Set(prev).add("wolf"));
            } else if (voiceChar === "grandmother") {
              console.log("👵 Switching to GRANDMOTHER voice");
              setCurrentSpeaker("grandmother");
              setIsAnimatedMode(true);
              setAppearedCharacters((prev) => new Set(prev).add("grandmother"));
            } else {
              console.warn("⚠️ Unknown voice character:", voiceChar);
            }
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      conversationRef.current = conv;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
      setIsConnected(false);
      setComponent({ type: null });
      setCurrentScene(1);
      setCurrentSpeaker("narrator");
      setAppearedCharacters(new Set());
      setStoryText("");
      setIsAwaitingInput(false);
      setIsHoldingSpacebar(false);
    }
  };

  const scene = scenes[currentScene - 1];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-stone-500 hover:text-stone-900 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-medium text-stone-900">
            Little Red Riding Hood
          </span>
          {isConnected ? (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full ${isMuted ? "text-red-500" : "text-stone-500"
                }`}
            >
              {isMuted ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>
      </header>

      <main className="pt-14 min-h-screen flex flex-col">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 text-sm text-center">
            {error} ·{" "}
            <button onClick={createAgent} className="underline">
              Retry
            </button>
          </div>
        )}

        {!isConnected ? (
          /* Start Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <h1 className="text-2xl font-bold text-stone-900 mb-2">
              Little Red Riding Hood
            </h1>
            <p className="text-stone-500 text-sm mb-6 text-center max-w-xs">
              An interactive story with voice, math challenges, and spelling
              practice.
            </p>

            {/* Character Avatars */}
            <div className="flex items-end justify-center gap-2 mb-8">
              {avatarList.map((avatar) => (
                <div key={avatar.name} className="flex flex-col items-center">
                  <div className="w-24 h-24 relative">
                    {isAnimatedMode ? (
                      <video
                        src={avatar.webm}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Image
                        src={avatar.png}
                        alt={avatar.name}
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                  <span className="text-xs text-stone-600 font-medium">
                    {avatar.name}
                  </span>
                </div>
              ))}
            </div>

            {showPermissionPrompt && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 max-w-xs">
                <div className="flex items-start gap-3">
                  <Mic className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-900 mb-1 text-sm">
                      Microphone Access
                    </h4>
                    <p className="text-xs text-amber-700 mb-2">
                      Enable your microphone for voice interaction.
                    </p>
                    <button
                      onClick={requestMicrophoneAccess}
                      className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-700"
                    >
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={async () => {
                if (!hasPermission) {
                  await requestMicrophoneAccess();
                }
                startConversation();
              }}
              disabled={isLoading || !agentId}
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              {isLoading ? "Loading..." : "Begin Story"}
            </button>

            {hasPermission && (
              <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Microphone ready
              </p>
            )}
          </div>
        ) : (
          /* Story Experience - Full Screen with Background */
          <div className="flex-1 relative">
            {/* Background Scene Image or Component */}
            <div className="absolute inset-0">
              {scene.component === "forest-paths" ? (
                <div className="w-full h-full flex items-center justify-center bg-stone-100">
                  <ForestPaths />
                </div>
              ) : scene.component === "pack-basket" ? (
                <div className="w-full h-full flex items-center justify-center bg-stone-100">
                  <PackBasket />
                </div>
              ) : scene.image ? (
                <>
                  <Image
                    src={scene.image}
                    alt={scene.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Overlay for readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/20" />
                </>
              ) : (
                <div className="w-full h-full bg-linear-to-br from-amber-200 to-orange-300" />
              )}
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col">
              {/* Top: Scene Title */}
              <div className="p-4">
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i + 1 === currentScene
                          ? "bg-red-500"
                          : i + 1 < currentScene
                            ? "bg-red-300"
                            : "bg-stone-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-stone-700">
                    {scene.title}
                  </span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex items-center justify-between p-6 gap-6">
                {/* Left: Story Text / Activities */}
                <div className="flex-1 max-w-md">
                  {/* Story Narration */}
                  {component.type === null && !isAwaitingInput && storyText && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                      <p className="text-lg text-stone-800 leading-relaxed">
                        {storyText}
                      </p>
                    </div>
                  )}

                  {/* User Input Mode */}
                  {isAwaitingInput && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                      <p className="text-lg text-stone-800 mb-4">
                        {storyText || "Your turn to speak!"}
                      </p>
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-stone-500">
                          hold down spacebar to speak
                        </p>
                        <button
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-medium transition-all ${isHoldingSpacebar
                            ? "bg-red-500 border-red-500 text-white scale-105 shadow-lg"
                            : "bg-white border-stone-300 text-stone-700 hover:border-stone-400"
                            }`}
                        >
                          {isHoldingSpacebar ? (
                            <>
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              Recording...
                            </>
                          ) : (
                            <>spacebar</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Activities */}
                  {component.type === "math" && component.props && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                      <MathQuestion
                        question={component.props.question as string}
                        answer={component.props.answer as number}
                        hint={component.props.hint as string | undefined}
                        onComplete={
                          component.props.onComplete as (
                            correct: boolean
                          ) => void
                        }
                      />
                    </div>
                  )}
                  {component.type === "spelling" && component.props && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                      <SpellingChallenge
                        word={component.props.word as string}
                        context={component.props.context as string}
                        onComplete={
                          component.props.onComplete as (
                            correct: boolean
                          ) => void
                        }
                      />
                    </div>
                  )}
                  {component.type === "completion" && component.props && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                      <CompletionMessage
                        message={component.props.message as string}
                      />
                    </div>
                  )}
                </div>

                {/* Right: Character Avatar */}
                <div className="flex flex-col items-center">
                  {/* Character Display */}
                  <div className="w-48 h-48 relative mb-2">
                    {currentSpeaker === "narrator" ? (
                      isAnimatedMode ? (
                        <video
                          src={characters.owl.webm}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      ) : (
                        <Image
                          src={characters.owl.png}
                          alt="Narrator (Owl)"
                          fill
                          className="object-contain drop-shadow-2xl"
                        />
                      )
                    ) : isAnimatedMode ? (
                      <video
                        src={characters[currentSpeaker as CharacterId]?.webm}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain drop-shadow-2xl"
                      />
                    ) : (
                      <Image
                        src={
                          characters[currentSpeaker as CharacterId]?.png || ""
                        }
                        alt={
                          characters[currentSpeaker as CharacterId]?.name ||
                          "Character"
                        }
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    )}
                  </div>
                  {/* Character Name Badge */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-lg">
                    <p className="font-bold text-stone-800 text-sm">
                      {currentSpeaker === "narrator"
                        ? "Narrator"
                        : characters[currentSpeaker as CharacterId]?.name}
                    </p>
                  </div>
                  {isSpeaking && (
                    <div className="mt-2 flex items-center gap-1 text-white text-xs">
                      <Volume2 className="w-3 h-3 animate-pulse" />
                      <span>Speaking...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Character Avatars */}
              <div className="p-4">
                <div className="flex items-center justify-center gap-4">
                  {(
                    ["red-riding-hood", "wolf", "grandmother"] as CharacterId[]
                  ).map((charId) => {
                    const char = characters[charId];
                    const isActive = currentSpeaker === charId;
                    const hasAppeared = appearedCharacters.has(charId);

                    return (
                      <div
                        key={charId}
                        className={`transition-all ${hasAppeared ? "opacity-100" : "opacity-40"
                          }`}
                      >
                        <div
                          className={`w-16 h-16 rounded-full overflow-hidden relative transition-all bg-white/20 backdrop-blur-sm ${isActive
                            ? "ring-4 ring-yellow-400 scale-110 shadow-xl"
                            : "ring-2 ring-white/50"
                            }`}
                        >
                          {isAnimatedMode && isActive ? (
                            <video
                              src={char.webm}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={char.png}
                              alt={char.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* End Button */}
                <div className="flex justify-center mt-3">
                  <button
                    onClick={endConversation}
                    className="text-xs text-white/70 hover:text-white underline"
                  >
                    End story
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
