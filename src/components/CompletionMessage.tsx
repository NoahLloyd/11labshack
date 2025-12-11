interface CompletionMessageProps {
  message: string;
}

export default function CompletionMessage({ message }: CompletionMessageProps) {
  return (
    <div className="text-center py-4">
      <p className="text-green-600 text-sm font-medium">✓ {message}</p>
    </div>
  );
}
