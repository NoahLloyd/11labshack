'use client';

import { useState } from 'react';

interface SpellingChallengeProps {
  word: string;
  context: string;
  onComplete: (correct: boolean) => void;
}

export default function SpellingChallenge({ word, context, onComplete }: SpellingChallengeProps) {
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const handleSubmit = () => {
    const isCorrect = userInput.toLowerCase().trim() === word.toLowerCase().trim();
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setTimeout(() => {
        onComplete(true);
      }, 2000);
    }
  };

  const handlePlayAudio = () => {
    // Use Web Speech API to speak the word
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h3 className="text-2xl font-bold text-blue-600 mb-4">Spelling Bee! 🐝</h3>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3 italic">"{context}"</p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handlePlayAudio}
            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            🔊 Hear the word
          </button>
        </div>

        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none tracking-wider"
          placeholder="Spell the word..."
          disabled={feedback === 'correct'}
        />
      </div>

      {feedback === 'correct' && (
        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-4">
          <p className="text-green-700 font-bold text-lg">🎉 Perfect spelling!</p>
          <p className="text-green-600 text-sm mt-1">The word was: {word}</p>
        </div>
      )}

      {feedback === 'incorrect' && (
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-700 font-bold">Not quite right. Try again!</p>
          <p className="text-red-600 text-sm mt-1">Listen carefully and try once more.</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!userInput || feedback === 'correct'}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        Submit Spelling
      </button>
    </div>
  );
}
