'use client';

interface CompletionMessageProps {
  message: string;
}

export default function CompletionMessage({ message }: CompletionMessageProps) {
  return (
    <div className="bg-linear-to-r from-yellow-100 to-orange-100 rounded-lg shadow-lg p-6 max-w-md w-full animate-bounce-in">
      <div className="text-center">
        <div className="text-6xl mb-4">⭐</div>
        <h3 className="text-2xl font-bold text-orange-600 mb-2">Great Job!</h3>
        <p className="text-lg text-gray-700">{message}</p>
      </div>
    </div>
  );
}
