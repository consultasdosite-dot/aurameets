"use client";

import { useState } from "react";

type ExpandableBioProps = {
  paragraphs: string[];
};

export default function ExpandableBio({ paragraphs }: ExpandableBioProps) {
  const [expanded, setExpanded] = useState(false);

  if (paragraphs.length === 0) return null;

  const hasMoreContent = paragraphs.length > 1;
  const visibleParagraphs = expanded ? paragraphs : paragraphs.slice(0, 1);

  return (
    <div className="mx-auto mt-8 max-w-5xl text-center sm:mt-10 sm:text-left">
      <div className="space-y-4">
        {visibleParagraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-[16px] leading-7 text-[#4f525b] sm:text-[18px] sm:leading-8"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {hasMoreContent && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-3 inline-flex items-center text-sm font-black uppercase tracking-[0.08em] text-[#7b2f72] transition hover:text-[#5B1F61]"
          aria-expanded={expanded}
        >
          {expanded ? "MENOS..." : "MAIS..."}
        </button>
      )}
    </div>
  );
}