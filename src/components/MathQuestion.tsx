'use client';

import { useState } from 'react';

interface MathQuestionProps {
  question: string;
  answer: number;
  hint?: string;
  onComplete: (correct: boolean) => void;
}

export default function MathQuestion({ question, answer, hint, onComplete }: MathQuestionProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const handleSubmit = () => {
    const isCorrect = parseInt(userAnswer) === answer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setTimeout(() => {
        onComplete(true);
      }, 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <h3 className="text-2xl font-bold text-purple-600 mb-4">Math Challenge!</h3>

      <div className="mb-6">
        <p className="text-lg text-gray-800 mb-4">{question}</p>

        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
          placeholder="Your answer..."
          disabled={feedback === 'correct'}
        />
      </div>

      {feedback === 'correct' && (
        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-4">
          <p className="text-green-700 font-bold text-lg">🎉 Excellent! That&apos;s correct!</p>
        </div>
      )}

      {feedback === 'incorrect' && (
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-700 font-bold">Not quite. Try again!</p>
        </div>
      )}

      {hint && (
        <div className="mb-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            {showHint ? 'Hide hint' : 'Need a hint?'}
          </button>
          {showHint && (
            <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded">{hint}</p>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!userAnswer || feedback === 'correct'}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        Check Answer
      </button>
    </div>
  );
}
