"use client";

import React, { useState } from "react";

const CaviardedWord: React.FC<{ children: string; variant?: number }> = ({
  children,
  variant = 0,
}) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <button
      className={
        `caviarded-toggle variant-${variant % 5}` +
        (revealed ? " revealed" : "")
      }
      onClick={() => setRevealed(!revealed)}
      aria-pressed={revealed}
      title={revealed ? "Cliquez pour masquer" : "Cliquez pour révéler"}
    >
      {children}
    </button>
  );
};

export default CaviardedWord;
