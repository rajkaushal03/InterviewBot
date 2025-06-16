"use client";

export default function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-card text-card-foreground px-4 py-3 rounded-2xl shadow-md rounded-bl-lg border animate-pulse">
        <p className="text-sm text-muted-foreground">Swayam is typing...</p>
      </div>
    </div>
  );
}
