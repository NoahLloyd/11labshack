"use client";

import { useState } from "react";

interface MathQuestionProps {
  question: string;
  answer: number;
  hint?: string;
  onComplete: (correct: boolean) => void;
}

export default function MathQuestion({
  question,
  answer,
  hint,
  onComplete,
}: MathQuestionProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );

  const handleSubmit = () => {
    const isCorrect = parseInt(userAnswer) === answer;
    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      setTimeout(() => onComplete(true), 1500);
    }
  };

  return (
    <div className="w-full max-w-xs">
      <p className="text-xs text-stone-500 mb-1">Math</p>
      <p className="text-stone-900 mb-4">{question}</p>

      <input
        type="number"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:border-stone-500 focus:ring-0 outline-none mb-2"
        placeholder="Answer"
        disabled={feedback === "correct"}
      />

      {feedback === "correct" && (
        <p className="text-green-600 text-sm mb-2">Correct!</p>
      )}
      {feedback === "incorrect" && (
        <p className="text-red-500 text-sm mb-2">Try again</p>
      )}

      {hint && !feedback && (
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-xs text-stone-400 hover:text-stone-600 mb-2"
        >
          {showHint ? "Hide hint" : "Hint"}
        </button>
      )}
      {showHint && hint && (
        <p className="text-xs text-stone-500 bg-stone-50 p-2 rounded mb-2">
          {hint}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!userAnswer || feedback === "correct"}
        className="w-full bg-stone-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-stone-800 disabled:bg-stone-300"
      >
        Check
      </button>
    </div>
  );
}
