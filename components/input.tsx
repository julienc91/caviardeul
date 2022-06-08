import React, { ChangeEvent, useCallback, useState } from "react";
import { isWord, splitWords } from "../utils/caviarding";
import { ArrowUp } from "../assets/inlineImages";
import Image from "next/image";

const Input: React.FC<{
  disabled: boolean;
  onConfirm: (value: string) => void;
}> = ({ disabled, onConfirm }) => {
  const [value, setValue] = useState<string>("");
  const [lastValue, setLastValue] = useState<string>("");

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value.replace(/\s/gi, ""));
    },
    [setValue]
  );

  const handleSubmit = useCallback(() => {
    onConfirm(splitWords(value).filter(isWord).join().toLocaleLowerCase());
    setLastValue(value);
    setValue("");
  }, [onConfirm, value]);

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
    [handleSubmit, value, lastValue]
  );

  const handleScrollTop = useCallback(() => {
    document
      .getElementById("article")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="guess-input">
      <div
        className="article-navigation"
        onClick={handleScrollTop}
        title="Retour au début"
      >
        <Image src={ArrowUp} width={25} height={25} alt="Flèche vers le haut" />
      </div>
      <input
        type="text"
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Un mot ?"
      />
      <input
        type="submit"
        disabled={disabled}
        onClick={handleSubmit}
        value="Valider"
      />
    </div>
  );
};

export default Input;
