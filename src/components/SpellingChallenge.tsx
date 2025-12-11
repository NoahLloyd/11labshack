"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";

interface SpellingChallengeProps {
  word: string;
  context: string;
  onComplete: (correct: boolean) => void;
}

export default function SpellingChallenge({
  word,
  context,
  onComplete,
}: SpellingChallengeProps) {
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );

  const handleSubmit = () => {
    const isCorrect =
      userInput.toLowerCase().trim() === word.toLowerCase().trim();
    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      setTimeout(() => onComplete(true), 1500);
    }
  };

  const handlePlayAudio = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-xs">
      <p className="text-xs text-stone-500 mb-1">Spelling</p>
      <p className="text-sm text-stone-600 italic mb-3">
        &quot;{context}&quot;
      </p>

      <button
        onClick={handlePlayAudio}
        className="inline-flex items-center gap-1.5 text-xs text-stone-50 hover:text-stone-700 mb-3"
      >
        <Volume2 className="w-3 h-3" />
        Hear word
      </button>

      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-black text-sm focus:border-stone-500 focus:ring-0 outline-none mb-2 tracking-wide"
        placeholder="Spell it"
        disabled={feedback === "correct"}
      />

      {feedback === "correct" && (
        <p className="text-green-600 text-sm mb-2">Correct! ({word})</p>
      )}
      {feedback === "incorrect" && (
        <p className="text-red-500 text-sm mb-2">Try again</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!userInput || feedback === "correct"}
        className="w-full bg-stone-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-stone-800 disabled:bg-stone-300"
      >
        Check
      </button>
    </div>
  );
}
