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
  const [component, setComponent] = useState<InteractiveComponent>({ type: null });
  const conversationRef = useRef<Conversation | null>(null);

  useEffect(() => {
    createAgent();
  }, []);

  const createAgent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/agent/create", { method: "POST" });
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
        onError: (error) => {
          console.error("Conversation error:", error);
          setError("Connection error");
        },
        onModeChange: (mode) => {
          setIsSpeaking(mode.mode === "speaking");
        },
        onToolCall: handleToolCall,
      });
      conversationRef.current = conv;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
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

    if (toolName === "show_graphic") {
      setCurrentScene((parameters.scene as number) || 1);
    } else if (toolName === "show_math") {
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
    } else if (toolName === "show_spelling") {
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
    } else if (toolName === "show_completion") {
      setComponent({ type: "completion", props: { message: parameters.message } });
      setTimeout(() => setComponent({ type: null }), 3000);
    }
  };

  const endConversation = async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
      setIsConnected(false);
      setComponent({ type: null });
      setCurrentScene(1);
    }
  };

  const scene = scenes[currentScene - 1];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-stone-500 hover:text-stone-900 text-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-medium text-stone-900">Little Red Riding Hood</span>
          {isConnected ? (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full ${isMuted ? "text-red-500" : "text-stone-500"}`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>
      </header>

      <main className="pt-14 min-h-screen flex flex-col">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 text-sm text-center">
            {error} · <button onClick={createAgent} className="underline">Retry</button>
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
              An interactive story with voice, math challenges, and spelling practice.
            </p>
            <button
              onClick={startConversation}
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
          </div>
        ) : (
          /* Story Experience */
          <div className="flex-1 flex flex-col">
            {/* Scene Image */}
            <div className="flex-1 relative bg-stone-200 min-h-[50vh]">
              <Image
                src={scene.image}
                alt={scene.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              {/* Fallback gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-rose-100 to-rose-200 -z-10" />
              
              {/* Scene indicator */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-xs font-medium text-stone-700">
                  {currentScene}/10 · {scene.title}
                </span>
              </div>

              {/* Speaking indicator */}
              {isSpeaking && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                  <Volume2 className="w-3 h-3 text-stone-600" />
                  <span className="text-xs text-stone-600">Speaking...</span>
                </div>
              )}
            </div>

            {/* Bottom Panel */}
            <div className="bg-white border-t border-stone-200">
              {/* Progress Bar */}
              <div className="h-1 bg-stone-100">
                <div 
                  className="h-full bg-stone-900 transition-all duration-500"
                  style={{ width: `${(currentScene / 10) * 100}%` }}
                />
              </div>

              {/* Activity Area */}
              <div className="p-6">
                {component.type === null ? (
                  <div className="text-center py-4">
                    <p className="text-stone-400 text-sm">
                      {isSpeaking ? "Listen to the story..." : "Say something to continue..."}
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-center">
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
                )}
              </div>

              {/* End Button */}
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={endConversation}
                  className="w-full text-xs text-stone-400 hover:text-stone-600"
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
