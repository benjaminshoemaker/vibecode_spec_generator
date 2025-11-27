"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface GitHubStarsProps {
  repo: string;
}

export default function GitHubStars({ repo }: GitHubStarsProps) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Keep stars as null on error
      });
  }, [repo]);

  return (
    <a
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-2 py-1 border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
    >
      <Star className="w-3 h-3" />
      <span>{stars !== null ? stars.toLocaleString() : "—"}</span>
      <span>GitHub</span>
    </a>
  );
}
