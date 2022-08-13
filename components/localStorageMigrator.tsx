import React, { useCallback, useEffect, useState } from "react";
import { DEPRECATED_DOMAIN } from "../utils/config";
import { decode, encode } from "../utils/encryption";
import SaveManagement from "../utils/save";
import { ScoreHistory } from "../types";

const LocalStorageMigrator: React.FC = () => {
  const [domain, setDomain] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setDomain(window.location.host);
  }, [setDomain]);

  if (!domain || domain === DEPRECATED_DOMAIN) {
    return null;
  } else {
    return <LocalStorageMigratorReceiverComponent />;
  }
};

const _LocalStorageMigratorReceiverComponent: React.FC = () => {
  const handleMessage = useCallback((message: MessageEvent) => {
    const { data, origin } = message;
    if (!origin.includes(DEPRECATED_DOMAIN)) {
      return;
    }

    const [messageType, encryptedHistory, encryptedProgress, encryptionKey] =
      data.split(":");
    if (messageType !== "history") {
      return;
    }

    const migratedHistory = JSON.parse(
      decode(encryptedHistory, encryptionKey)
    ) as ScoreHistory[];
    const localHistory = SaveManagement.loadHistory();

    const historyByPuzzleId: Record<number, ScoreHistory> = {};
    localHistory.forEach((history) => {
      historyByPuzzleId[history.puzzleId] = history;
    });

    let shouldSave = false;

    migratedHistory.forEach((history) => {
      const currentHistory = historyByPuzzleId[history.puzzleId];
      if (!currentHistory) {
        historyByPuzzleId[history.puzzleId] = history;
        shouldSave = true;
      } else if (currentHistory.isOver && history.isOver) {
        if (currentHistory.nbTrials > history.nbTrials) {
          historyByPuzzleId[history.puzzleId] = history;
          shouldSave = true;
        }
      } else if (!currentHistory.isOver && history.isOver) {
        historyByPuzzleId[history.puzzleId] = history;
        shouldSave = true;
      }
    });

    if (!shouldSave) {
      return;
    }

    const mergedHistory = Object.keys(historyByPuzzleId)
      .map((i) => parseInt(i))
      .sort()
      .map((i) => historyByPuzzleId[i]);

    const key = SaveManagement.getEncryptionKey(true);
    const encodedHistory = encode(JSON.stringify(mergedHistory), key);
    localStorage.setItem("history", encodedHistory);

    if (encryptedProgress) {
      const decryptedProgress = decode(encryptedProgress, encryptionKey);
      const reEncryptedProgress = encode(
        JSON.stringify(decryptedProgress),
        key
      );
      localStorage.setItem("progress", reEncryptedProgress);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return (
    <iframe
      style={{ display: "none", width: 0, height: 0 }}
      src={`//${DEPRECATED_DOMAIN}/local-storage-migrator.html`}
    />
  );
};

const LocalStorageMigratorReceiverComponent = React.memo(
  _LocalStorageMigratorReceiverComponent
);

export default LocalStorageMigrator;
