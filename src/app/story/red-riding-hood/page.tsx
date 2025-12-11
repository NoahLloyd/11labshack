"use client";

import { useState, useEffect, useRef } from "react";
import { Conversation } from "@elevenlabs/client";
import { ArrowLeft, Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MathQuestion from "@/components/MathQuestion";
import SpellingChallenge from "@/components/SpellingChallenge";
import CompletionMessage from "@/components/CompletionMessage";

type InteractiveComponent = {
  type: "math" | "spelling" | "completion" | null;
  props?: Record<string, unknown>;
};

type CharacterId = "red-riding-hood" | "grandmother" | "wolf";
type Speaker = "narrator" | CharacterId;

interface CharacterConfig {
  name: string;
  avatar: string;
  color: string;
}

const characters: Record<CharacterId, CharacterConfig> = {
  "red-riding-hood": {
    name: "Little Red Riding Hood",
    avatar: "🧒",
    color: "red",
  },
  grandmother: {
    name: "Grandmother",
    avatar: "👵",
    color: "gray",
  },
  wolf: {
    name: "The Wolf",
    avatar: "🐺",
    color: "slate",
  },
};

const scenes: { title: string; image: string }[] = [
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
];

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
  const [appearedCharacters, setAppearedCharacters] = useState<Set<CharacterId>>(new Set());
  const [storyText, setStoryText] = useState<string>("");
  const [isAwaitingInput, setIsAwaitingInput] = useState(false);
  const [isHoldingSpacebar, setIsHoldingSpacebar] = useState(false);

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
        body: JSON.stringify({ storyId: "red-riding-hood" })
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
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onError: (error: string) => {
          console.error("Conversation error:", error);
          setError("Connection error");
        },
        onModeChange: (mode: { mode: string }) => {
          setIsSpeaking(mode.mode === "speaking");
        },
        clientTools: {
          show_character: (parameters: { character: string }) => {
            console.log("show_character called:", parameters);
            const charId = parameters.character as CharacterId;
            if (charId && characters[charId]) {
              setAppearedCharacters((prev) => new Set(prev).add(charId));
            }
          },
          show_narration: (parameters: { text: string; speaker?: string }) => {
            console.log("show_narration called:", parameters);
            setStoryText(parameters.text);
            if (parameters.speaker) {
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
          show_graphic: (parameters: { scene: number }) => {
            console.log("show_graphic called:", parameters);
            setCurrentScene(parameters.scene || 1);
          },
          show_math: async (parameters: {
            question: string;
            answer: number;
            hint?: string;
          }) => {
            console.log("show_math called:", parameters);
            return new Promise<string>((resolve) => {
              setComponent({
                type: "math",
                props: {
                  question: parameters.question,
                  answer: parameters.answer,
                  hint: parameters.hint,
                  onComplete: (correct: boolean) => {
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
            console.log("show_spelling called:", parameters);
            return new Promise<string>((resolve) => {
              setComponent({
                type: "spelling",
                props: {
                  word: parameters.word,
                  context: parameters.context,
                  onComplete: (correct: boolean) => {
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
            console.log("change_voice called:", parameters);
            setCurrentSpeaker(parameters.character as Speaker);
            // Voice switching happens server-side via supported_voices
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
            <div className="w-48 h-48 bg-stone-200 rounded-2xl mb-8 overflow-hidden relative">
              <Image
                src="/scenes/cover.png"
                alt="Little Red Riding Hood"
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                🧒
              </div>
            </div>
            <h1 className="text-xl font-medium text-stone-900 mb-2">
              Little Red Riding Hood
            </h1>
            <p className="text-stone-500 text-sm mb-8 text-center max-w-xs">
              An interactive story with voice, math challenges, and spelling
              practice.
            </p>

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
          /* Story Experience */
          <div className="flex-1 flex flex-col">
            <div className="flex-1 grid lg:grid-cols-2 gap-4 p-4">
              {/* Left: Story Narration / Activities */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col min-h-125">
                {/* Story Narration */}
                {component.type === null && !isAwaitingInput && (
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3">
                        <span className="text-2xl">📖</span>
                      </div>
                    </div>
                    {storyText ? (
                      <div className="text-center">
                        <p className="text-lg text-stone-700 leading-relaxed">
                          {storyText}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-stone-400">
                        <p className="text-sm">
                          {isSpeaking ? "Listen to the story..." : "Waiting for narration..."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* User Input Mode */}
                {isAwaitingInput && (
                  <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className="mb-6">
                      <div className="text-5xl mb-4">🎤</div>
                      <h3 className="text-xl font-bold text-stone-900 mb-3">
                        {storyText || "Your turn to speak!"}
                      </h3>
                    </div>
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
                  <div className="flex-1 flex items-center justify-center">
                    <MathQuestion
                      question={component.props.question as string}
                      answer={component.props.answer as number}
                      hint={component.props.hint as string | undefined}
                      onComplete={
                        component.props.onComplete as (correct: boolean) => void
                      }
                    />
                  </div>
                )}
                {component.type === "spelling" && component.props && (
                  <div className="flex-1 flex items-center justify-center">
                    <SpellingChallenge
                      word={component.props.word as string}
                      context={component.props.context as string}
                      onComplete={
                        component.props.onComplete as (correct: boolean) => void
                      }
                    />
                  </div>
                )}
                {component.type === "completion" && component.props && (
                  <div className="flex-1 flex items-center justify-center">
                    <CompletionMessage
                      message={component.props.message as string}
                    />
                  </div>
                )}
              </div>

              {/* Right: Character Display */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col min-h-125">
                <div
                  className={`flex-1 p-6 flex flex-col items-center justify-center transition-all ${currentSpeaker === "red-riding-hood"
                    ? "bg-linear-to-br from-red-400 to-rose-500"
                    : currentSpeaker === "grandmother"
                      ? "bg-linear-to-br from-purple-400 to-pink-500"
                      : currentSpeaker === "wolf"
                        ? "bg-linear-to-br from-slate-600 to-gray-700"
                        : "bg-linear-to-br from-amber-200 to-orange-300"
                    }`}
                >
                  <div className="text-8xl mb-4">
                    {currentSpeaker === "narrator"
                      ? "📖"
                      : characters[currentSpeaker as CharacterId]?.avatar}
                  </div>
                  <div className="bg-white rounded-xl px-4 py-2 shadow-lg">
                    <p className="font-bold text-stone-900 text-lg">
                      {currentSpeaker === "narrator"
                        ? "Narrator"
                        : characters[currentSpeaker as CharacterId]?.name}
                    </p>
                  </div>
                </div>

                {/* Scene Progress */}
                <div className="p-4 bg-stone-50">
                  <div className="flex justify-center gap-1.5 mb-2">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${i + 1 === currentScene
                          ? "bg-red-500"
                          : i + 1 < currentScene
                            ? "bg-red-300"
                            : "bg-stone-200"
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-center text-xs text-stone-600">
                    Scene {currentScene}/10 · {scene.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom: Character Avatars */}
            <div className="bg-white border-t border-stone-200 p-4">
              <div className="flex items-center justify-center gap-6 mb-3">
                {(Object.keys(characters) as CharacterId[]).map((charId) => {
                  const char = characters[charId];
                  const isActive = currentSpeaker === charId;
                  const hasAppeared = appearedCharacters.has(charId);

                  return (
                    <div
                      key={charId}
                      className={`flex flex-col items-center transition-all ${hasAppeared ? "opacity-100" : "opacity-30"
                        }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl transition-all ${isActive
                          ? "ring-4 ring-yellow-400 scale-110 shadow-lg bg-linear-to-br from-yellow-100 to-amber-100"
                          : "ring-2 ring-stone-200 bg-stone-100"
                          }`}
                      >
                        {char.avatar}
                      </div>
                      <p
                        className={`text-xs font-medium mt-1 ${isActive ? "text-stone-900" : "text-stone-500"
                          }`}
                      >
                        {char.name.split(" ")[0]}
                      </p>
                      {isActive && (
                        <div className="mt-0.5 px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full">
                          Speaking
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  {isSpeaking && (
                    <>
                      <Volume2 className="w-3 h-3 animate-pulse" />
                      <span>Listening</span>
                    </>
                  )}
                </div>
                <button
                  onClick={endConversation}
                  className="text-xs text-stone-400 hover:text-stone-600 underline"
                >
                  End story
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
