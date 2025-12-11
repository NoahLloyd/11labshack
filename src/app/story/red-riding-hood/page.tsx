"use client";

import { useState, useEffect, useRef } from "react";
import { Conversation } from "@elevenlabs/client";
import { ArrowLeft, Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import Link from "next/link";
import MathQuestion from "@/components/MathQuestion";
import SpellingChallenge from "@/components/SpellingChallenge";
import CompletionMessage from "@/components/CompletionMessage";

type InteractiveComponent = {
  type: "math" | "spelling" | "completion" | null;
  props?: Record<string, unknown>;
};

const sceneEmojis: Record<number, string> = {
  1: "🏠",
  2: "🧺",
  3: "🌲",
  4: "🐺",
  5: "🎭",
  6: "🛤️",
  7: "🌸",
  8: "🏡",
  9: "⚔️",
  10: "🎉",
};

const sceneDescriptions: Record<number, string> = {
  1: "Red Riding Hood's Home",
  2: "Mother's Gift",
  3: "The Dark Forest",
  4: "Meeting the Wolf",
  5: "A Clever Disguise",
  6: "Two Paths",
  7: "Picking Flowers",
  8: "Grandmother's House",
  9: "The Rescue",
  10: "Happy Ending",
};

export default function RedRidingHoodStory() {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentScene, setCurrentScene] = useState(1);
  const [hasPermission, setHasPermission] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<string>("narrator");
  const [component, setComponent] = useState<InteractiveComponent>({
    type: null,
  });
  const conversationRef = useRef<Conversation | null>(null);

  useEffect(() => {
    createAgent();
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasPermission(result.state === 'granted');
      if (result.state === 'prompt') {
        setShowPermissionPrompt(true);
      }
    } catch (err) {
      console.log('Permission API not supported, will request on start');
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setShowPermissionPrompt(false);
    } catch (err) {
      setError('Microphone access is required for voice interaction. Please enable it in your browser settings.');
    }
  };

  const createAgent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/agent/create", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create agent");
      }

      const data = await response.json();
      setAgentId(data.agent_id);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create agent");
      console.error("Error creating agent:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async () => {
    if (!agentId) return;

    try {
      setIsLoading(true);

      const conv = await Conversation.startSession({
        agentId: agentId,
        onConnect: () => {
          console.log("Connected to agent");
          setIsConnected(true);
        },
        onDisconnect: () => {
          console.log("Disconnected from agent");
          setIsConnected(false);
        },
        onError: (error) => {
          console.error("Conversation error:", error);
          setError("Connection error occurred");
        },
        onToolCall: (toolCall) => {
          console.log("Tool call received:", toolCall);
          handleToolCall(toolCall);
        },
      });

      conversationRef.current = conv;
      setConversation(conv);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start conversation"
      );
      console.error("Error starting conversation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolCall = (toolCall: {
    toolName: string;
    parameters: Record<string, unknown>;
    toolCallId?: string;
  }) => {
    const { toolName, parameters } = toolCall;

    switch (toolName) {
      case "show_graphic":
        setCurrentScene((parameters.scene as number) || 1);
        break;

      case "change_voice":
        // Map character names to voice IDs
        const voiceMap: Record<string, string> = {
          narrator: "21m00Tcm4TlvDq8ikWAM", // Default narrator
          red_riding_hood: "uNX8xsOx2EBjgaerCsRt", // Little Red Riding Hood
          wolf: "zt3hcTSXa6Wt6GbOg5Ho", // The Wolf
          grandmother: "ueNx3ohiKrOvUObXedKm", // Grandmother
        };

        const character = parameters.character as string;
        const newVoiceId = voiceMap[character];

        if (newVoiceId && conversationRef.current) {
          try {
            // Update voice dynamically
            conversationRef.current.setVoice(newVoiceId);
            setCurrentCharacter(character);
            console.log(`Voice changed to: ${character} (${newVoiceId})`);
          } catch (error) {
            console.error("Failed to change voice:", error);
          }
        }
        break;

      case "show_math":
        setComponent({
          type: "math",
          props: {
            question: parameters.question,
            answer: parameters.answer,
            hint: parameters.hint,
            onComplete: (correct: boolean) => {
              if (conversationRef.current && toolCall.toolCallId) {
                conversationRef.current.sendToolResponse({
                  toolCallId: toolCall.toolCallId,
                  response: JSON.stringify({ correct }),
                });
              }
              setComponent({ type: null });
            },
          },
        });
        break;

      case "show_spelling":
        setComponent({
          type: "spelling",
          props: {
            word: parameters.word,
            context: parameters.context,
            onComplete: (correct: boolean) => {
              if (conversationRef.current && toolCall.toolCallId) {
                conversationRef.current.sendToolResponse({
                  toolCallId: toolCall.toolCallId,
                  response: JSON.stringify({ correct }),
                });
              }
              setComponent({ type: null });
            },
          },
        });
        break;

      case "show_completion":
        setComponent({
          type: "completion",
          props: {
            message: parameters.message,
          },
        });
        setTimeout(() => setComponent({ type: null }), 3000);
        break;
    }
  };

  const endConversation = async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
      setConversation(null);
      setIsConnected(false);
      setComponent({ type: null });
      setCurrentScene(1);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-red-50 to-orange-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Library</span>
          </Link>
          <h1 className="font-semibold text-gray-900">Little Red Riding Hood</h1>
          <div className="w-32" />
        </div>
      </header>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
              <button
                onClick={createAgent}
                className="ml-4 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {!isConnected ? (
            /* Start Screen */
            <div className="text-center max-w-xl mx-auto py-12">
              <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <span className="text-6xl">🧒</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Little Red Riding Hood
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                An interactive voice adventure with math and spelling challenges.
                Speak naturally to guide the story and learn along the way!
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">
                  What you&apos;ll experience:
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl mb-2">🎭</div>
                    <p className="text-sm text-gray-600">10 Story Scenes</p>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">🔢</div>
                    <p className="text-sm text-gray-600">Math Challenges</p>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">📝</div>
                    <p className="text-sm text-gray-600">Spelling Practice</p>
                  </div>
                </div>
              </div>

              {showPermissionPrompt && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <Mic className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 mb-1">Microphone Access Needed</h4>
                      <p className="text-sm text-amber-700 mb-3">
                        This story uses voice interaction. We&apos;ll need access to your microphone to hear you speak.
                      </p>
                      <button
                        onClick={requestMicrophoneAccess}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                      >
                        Enable Microphone
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
                  if (hasPermission || !showPermissionPrompt) {
                    startConversation();
                  }
                }}
                disabled={isLoading || !agentId}
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-rose-600 text-white px-10 py-5 rounded-full font-semibold text-lg hover:from-red-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Preparing story...
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6" />
                    Begin Adventure
                  </>
                )}
              </button>
              {hasPermission && (
                <p className="text-sm text-green-600 mt-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Microphone ready
                </p>
              )}
            </div>
          ) : (
            /* Story Experience */
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Scene Display */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-red-500 to-rose-600 p-8 min-h-[400px] flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-8 left-8 w-24 h-24 border-4 border-white rounded-full" />
                    <div className="absolute bottom-8 right-8 w-16 h-16 border-4 border-white rotate-45" />
                  </div>
                  <div className="text-center relative z-10">
                    <div className="text-8xl mb-6">
                      {sceneEmojis[currentScene]}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Scene {currentScene}
                    </h3>
                    <p className="text-white/80">
                      {sceneDescriptions[currentScene]}
                    </p>
                  </div>
                </div>

                {/* Scene Progress */}
                <div className="p-6">
                  <div className="flex justify-center gap-2">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-colors ${i + 1 === currentScene
                          ? "bg-red-500"
                          : i + 1 < currentScene
                            ? "bg-red-300"
                            : "bg-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Interactive Area */}
              <div className="space-y-6">
                {/* Controls */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Volume2 className="w-6 h-6 text-white animate-pulse" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Listening...</p>
                        <p className="text-sm text-gray-500">
                          Speaking as: <span className="font-medium text-gray-700 capitalize">{currentCharacter.replace('_', ' ')}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={toggleMute}
                        className={`p-3 rounded-full transition-colors ${isMuted
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        {isMuted ? (
                          <MicOff className="w-5 h-5" />
                        ) : (
                          <Mic className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Component Area */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 min-h-[300px] flex items-center justify-center">
                  {component.type === null && (
                    <div className="text-center text-gray-400">
                      <div className="text-5xl mb-4">🎯</div>
                      <p className="text-lg font-medium">Listen to the story...</p>
                      <p className="text-sm mt-2">
                        Activities will appear here!
                      </p>
                    </div>
                  )}

                  {component.type === "math" && component.props && (
                    <MathQuestion
                      question={component.props.question as string}
                      answer={component.props.answer as number}
                      hint={component.props.hint as string | undefined}
                      onComplete={component.props.onComplete as (correct: boolean) => void}
                    />
                  )}

                  {component.type === "spelling" && component.props && (
                    <SpellingChallenge
                      word={component.props.word as string}
                      context={component.props.context as string}
                      onComplete={component.props.onComplete as (correct: boolean) => void}
                    />
                  )}

                  {component.type === "completion" && component.props && (
                    <CompletionMessage message={component.props.message as string} />
                  )}
                </div>

                {/* End Story Button */}
                <button
                  onClick={endConversation}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  End Story
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

