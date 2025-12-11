'use client';

import { useState, useEffect, useRef } from 'react';
import MathQuestion from '@/components/MathQuestion';
import SpellingChallenge from '@/components/SpellingChallenge';
import CompletionMessage from '@/components/CompletionMessage';
import { Conversation } from '@elevenlabs/client';

type ToolCall = {
  tool: string;
  params: any;
};

type InteractiveComponent = {
  type: 'math' | 'spelling' | 'completion' | null;
  props?: any;
};

export default function Home() {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentScene, setCurrentScene] = useState(1);
  const [component, setComponent] = useState<InteractiveComponent>({ type: null });
  const conversationRef = useRef<Conversation | null>(null);

  // Create the agent on component mount
  useEffect(() => {
    createAgent();
  }, []);

  const createAgent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agent/create', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const data = await response.json();
      setAgentId(data.agent_id);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
      console.error('Error creating agent:', err);
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
          console.log('Connected to agent');
          setIsConnected(true);
        },
        onDisconnect: () => {
          console.log('Disconnected from agent');
          setIsConnected(false);
        },
        onError: (error) => {
          console.error('Conversation error:', error);
          setError('Connection error occurred');
        },
        onToolCall: (toolCall) => {
          console.log('Tool call received:', toolCall);
          handleToolCall(toolCall);
        },
      });

      conversationRef.current = conv;
      setConversation(conv);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
      console.error('Error starting conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolCall = (toolCall: any) => {
    const { toolName, parameters } = toolCall;

    switch (toolName) {
      case 'show_graphic':
        setCurrentScene(parameters.scene || 1);
        break;

      case 'show_math':
        setComponent({
          type: 'math',
          props: {
            question: parameters.question,
            answer: parameters.answer,
            hint: parameters.hint,
            onComplete: (correct: boolean) => {
              // Send response back to agent
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

      case 'show_spelling':
        setComponent({
          type: 'spelling',
          props: {
            word: parameters.word,
            context: parameters.context,
            onComplete: (correct: boolean) => {
              // Send response back to agent
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

      case 'show_completion':
        setComponent({
          type: 'completion',
          props: {
            message: parameters.message,
          },
        });
        // Auto-hide completion message after 3 seconds
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            Red Riding Hood&apos;s Learning Adventure
          </h1>
          <p className="text-gray-600">An interactive story with math and spelling!</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!isConnected && (
          <div className="text-center mb-8">
            <button
              onClick={startConversation}
              disabled={isLoading || !agentId}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-all transform hover:scale-105"
            >
              {isLoading ? 'Loading...' : 'Start Story Adventure! 🎭'}
            </button>
          </div>
        )}

        {isConnected && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Side - Graphics */}
              <div className="bg-white rounded-lg shadow-xl p-6">
                <div className="aspect-square bg-gradient-to-br from-green-200 to-blue-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <img
                    src={`/scene-${currentScene}.jpg`}
                    alt={`Story scene ${currentScene}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-lg">
                      <p className="text-6xl mb-2">
                        {currentScene === 1 && '🏠'}
                        {currentScene === 2 && '🧺'}
                        {currentScene === 3 && '🌲'}
                        {currentScene === 4 && '🐺'}
                        {currentScene === 5 && '🎭'}
                        {currentScene === 6 && '🛤️'}
                        {currentScene === 7 && '🌸'}
                        {currentScene === 8 && '🏡'}
                        {currentScene === 9 && '⚔️'}
                        {currentScene === 10 && '🎉'}
                      </p>
                      <p className="text-2xl font-bold text-purple-700">Scene {currentScene}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${i + 1 === currentScene ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Side - Interactive Components */}
              <div className="bg-white rounded-lg shadow-xl p-6 flex items-center justify-center min-h-[400px]">
                {component.type === null && (
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-xl">Listen to the story...</p>
                    <p className="text-sm mt-2">Activities will appear here!</p>
                  </div>
                )}

                {component.type === 'math' && component.props && (
                  <MathQuestion {...component.props} />
                )}

                {component.type === 'spelling' && component.props && (
                  <SpellingChallenge {...component.props} />
                )}

                {component.type === 'completion' && component.props && (
                  <CompletionMessage {...component.props} />
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={endConversation}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
              >
                End Story
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
