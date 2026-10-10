import React, { ChangeEvent, useCallback, useContext, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { useContextSelector } from "use-context-selector";

import { GameContext } from "@caviardeul/components/game/gameManager";
import { SettingsContext } from "@caviardeul/components/settings/manager";
import { isWord, splitWords } from "@caviardeul/utils/caviarding";

const PinIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 17v5" />
    <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
  </svg>
);

const Input = () => {
  const [canPlay, isOver, makeAttempt] = useContextSelector(
    GameContext,
    (context) => [context.canPlay, context.isOver, context.makeAttempt],
  );
  const { settings, onChangeSettings } = useContext(SettingsContext);
  const isPinned = !settings.autoScroll;
  const pinLabel = isPinned
    ? "Activer le défilement auto"
    : "Bloquer le défilement auto";
  const [value, setValue] = useState<string>("");
  const [lastValue, setLastValue] = useState<string>("");

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value.replace(/\s/gi, ""));
    },
    [setValue],
  );

  const handleSubmit = useCallback(() => {
    makeAttempt(splitWords(value).filter(isWord).join().toLocaleLowerCase());
    setLastValue(value);
    setValue("");
  }, [makeAttempt, value]);

  const handleTogglePin = useCallback(() => {
    onChangeSettings({ autoScroll: isPinned });
  }, [onChangeSettings, isPinned]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Cmd on macOS
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleTogglePin();
      } else if (event.key === "Enter") {
        handleSubmit();
      } else if (event.key === "ArrowDown" && !value.length) {
        setValue(lastValue);
      } else if (event.key === "ArrowUp" && value === lastValue) {
        setValue("");
      }
    },
    [handleSubmit, handleTogglePin, value, lastValue],
  );

  const handleScrollTop = useCallback(() => {
    document
      .querySelector(".article-container")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="guess-input">
      <div
        className="article-navigation"
        onClick={handleScrollTop}
        title="Retour au début"
      >
        <FaArrowUp />
      </div>
      <div className="field">
        <input
          type="text"
          disabled={!canPlay}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Un mot ?"
        />
        {!isOver && (
          <button
            type="button"
            className={"pin" + (isPinned ? " pinned" : "")}
            onClick={handleTogglePin}
            aria-label={pinLabel}
            aria-keyshortcuts="Control+Enter"
            title={`${pinLabel} (Ctrl+Entrée)`}
          >
            <PinIcon />
          </button>
        )}
      </div>
      <input
        type="submit"
        disabled={!canPlay}
        onClick={handleSubmit}
        value="Valider"
      />
    </div>
  );
};

export default Input;
