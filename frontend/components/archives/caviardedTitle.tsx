import React, { useMemo } from "react";

import { isCommonWord, isWord, splitWords } from "@caviardeul/utils/caviarding";
import { decode } from "@caviardeul/utils/encryption";

const decodeTitle = (encryptedPageName: string, key: string): string | null => {
  try {
    return decode(encryptedPageName, key);
  } catch {
    return null;
  }
};

const CaviardedTitle: React.FC<{
  encryptedPageName: string;
  encryptionKey: string;
}> = ({ encryptedPageName, encryptionKey }) => {
  const tokens = useMemo(() => {
    const title = decodeTitle(encryptedPageName, encryptionKey);
    return title === null ? null : splitWords(title);
  }, [encryptedPageName, encryptionKey]);

  if (tokens === null) {
    return (
      <span className="caviarded-title">
        <span className="caviarded">?</span>
      </span>
    );
  }

  return (
    <span className="caviarded-title">
      {tokens.map((token, i) =>
        isWord(token) && !isCommonWord(token) ? (
          <span key={i} className="caviarded">
            {"█".repeat(token.length)}
          </span>
        ) : (
          <React.Fragment key={i}>{token}</React.Fragment>
        ),
      )}
    </span>
  );
};

export default CaviardedTitle;
