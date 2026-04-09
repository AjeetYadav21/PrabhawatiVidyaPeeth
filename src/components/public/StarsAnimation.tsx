"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

type StarConfig = {
  id: number;
  style: CSSProperties;
};

const orbitAnimations = [
  "orbit-small",
  "orbit-medium",
  "orbit-large",
  "orbit-reverse-small",
  "orbit-reverse-medium"
];

function generateStars(): StarConfig[] {
  return Array.from({ length: 50 }, (_, index) => {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const size = Math.random() * 2 + 1;
    const twinkleDuration = Math.random() * 3 + 3;
    const orbitDuration = Math.random() * 10 + 8;
    const delay = Math.random() * 4;
    const orbitType = orbitAnimations[Math.floor(Math.random() * orbitAnimations.length)];
    const orbitEnabled = Math.random() > 0.3;

    return {
      id: index,
      style: {
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        animation: orbitEnabled
          ? `twinkle ${twinkleDuration}s ease-in-out infinite ${delay}s, ${orbitType} ${orbitDuration}s linear infinite ${delay}s`
          : `twinkle ${twinkleDuration}s ease-in-out infinite ${delay}s`
      }
    };
  });
}

export default function StarsAnimation() {
  const [stars] = useState(generateStars);

  return (
    <div className="stars" id="stars" aria-hidden="true">
      {stars.map((star) => (
        <span key={star.id} className="star" style={star.style} />
      ))}
    </div>
  );
}
