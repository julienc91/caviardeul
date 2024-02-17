import React, { ChangeEvent, useCallback, useContext, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

import { GameContext } from "@caviardeul/components/game/gameManager";
import { isWord, splitWords } from "@caviardeul/utils/caviarding";

const Input = () => {
  const { canPlay, makeAttempt } = useContext(GameContext);
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

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSubmit();
      } else if (event.key === "ArrowDown" && !value.length) {
        setValue(lastValue);
      } else if (event.key === "ArrowUp" && value === lastValue) {
        setValue("");
      }
    },
    [handleSubmit, value, lastValue],
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
      <input
        type="text"
        disabled={!canPlay}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Un mot ?"
      />
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
