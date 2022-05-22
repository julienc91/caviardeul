import React, { ChangeEvent, useCallback, useState } from "react";
import { isWord, splitWords } from "../utils/caviarding";

const Input: React.FC<{
  disabled: boolean;
  onConfirm: (value: string) => void;
}> = ({ disabled, onConfirm }) => {
  const [value, setValue] = useState<string>("");

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value.replace(/\s/gi, ""));
    },
    [setValue]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSubmit();
      }
    },
    [onConfirm, value]
  );

  const handleSubmit = useCallback(() => {
    onConfirm(splitWords(value).filter(isWord).join().toLocaleLowerCase());
    setValue("");
  }, [onConfirm, value]);

  return (
    <div className="guess-input">
      <input
        type="text"
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Essai"
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
