import latinize from "latinize";

const commonWords = new Set<string>([
  "a",
  "à",
  "ainsi",
  "alors",
  "après",
  "autour",
  "avant",
  "avec",
  "au",
  "aux",
  "c",
  "ça",
  "car",
  "ce",
  "ces",
  "comme",
  "contre",
  "d",
  "dans",
  "de",
  "depuis",
  "des",
  "dès",
  "donc",
  "du",
  "en",
  "entre",
  "est",
  "et",
  "jusqu",
  "l",
  "la",
  "le",
  "les",
  "mais",
  "n",
  "ne",
  "non",
  "ou",
  "où",
  "par",
  "pas",
  "pendant",
  "plus",
  "pour",
  "qu",
  "que",
  "qui",
  "s",
  "se",
  "si",
  "sur",
  "un",
  "une",
  "vers",
  "y",
]);

export const closeAlternativesSuffixes = ["e", "s", "es", "r", "x"];
const punctuationList = "{}()\\[\\]\\\\.…,;:!¡?¿/@#%\\^&*_—~+\\-=<>«»\"'’\\s";
const wordRegex = new RegExp(`^[^${punctuationList}]+$`, "i");
const separatorRegex = new RegExp(`([${punctuationList}]+)`, "gim");

export const splitWords = (
  text: string,
  isMarkdown: boolean = false,
): string[] => {
  const splittedText = text.split(separatorRegex);
  const result = [];

  if (splittedText.length >= 3 && isMarkdown) {
    for (let i = 0; i < splittedText.length - 1; i++) {
      // Regroup items when they correspond to an ordered list marker
      const separator1 = splittedText[i];
      const number = splittedText[i + 1];
      const separator2 = splittedText[i + 2];
      if (
        separator1.match(/\n\s*/) &&
        number.match(/\d+/) &&
        separator2.match(/\.\s+/)
      ) {
        result.push(`${separator1}${number}${separator2}`);
        i += 2;
      } else {
        result.push(separator1);
      }
    }
  } else {
    result.push(...splittedText);
  }
  return result;
};

export const isWord = (word: string): boolean => {
  return !!word.match(wordRegex);
};

export const isCommonWord = (word: string): boolean => {
  return commonWords.has(word.toLocaleLowerCase());
};

const getRelatedCommonWords = (word: string): string[] => {
  word = word.toLocaleLowerCase();
  return Array.from(commonWords).filter(
    (commonWord) => word === standardizeText(commonWord),
  );
};

export const countOccurrences = (
  text: string,
  standardizedText: string,
  word: string,
  withCloseAlternatives: boolean,
): number => {
  const standardizedWord = standardizeText(word);
  const allowedSuffixes = withCloseAlternatives
    ? `(${closeAlternativesSuffixes.join("|")})?`
    : "";
  const regex = new RegExp(
    `\([${punctuationList}]|^)(${standardizedWord})${allowedSuffixes}([${punctuationList}]|$)`,
    "gim",
  );
  const matches = Array.from(standardizedText.matchAll(regex));
  let count = matches.length;

  // Substract matches of the related common words, if they exist
  const relatedCommonWords = getRelatedCommonWords(standardizedWord);
  count -= relatedCommonWords
    .map((commonWord) => {
      const regex = new RegExp(
        `\([${punctuationList}]|^)(${commonWord})([${punctuationList}]|$)`,
        "gim",
      );
      return Array.from(text.matchAll(regex)).length;
    })
    .reduce((a, b) => a + b, 0);
  return count;
};

/**
 * Build a list of words that are considered close enough to the given word
 * to be revealed simultaneously.
 * @param standardizedWord
 */
export const buildAlternatives = (standardizedWord: string): string[] =>
  closeAlternativesSuffixes.map((suffix) => `${standardizedWord}${suffix}`);

/**
 * Determine if a word (assumed not to be from the common word set) should be revealed
 * or not.
 * @param word
 * @param revealedWords
 */
export const isRevealed = (
  word: string,
  revealedWords: Set<string>,
): boolean => {
  return revealedWords.has(standardizeText(word));
};

/**
 * Determine if a word is currently selected
 * @param word
 * @param selection
 * @param withCloseAlternatives
 */
export const isSelected = (
  word: string,
  selection: string,
  withCloseAlternatives: boolean,
): boolean => {
  const standardizedWord = standardizeText(word);
  if (standardizedWord === selection) {
    return true;
  }
  if (withCloseAlternatives) {
    if (
      buildAlternatives(selection).some(
        (alternative) => alternative === standardizedWord,
      )
    ) {
      return true;
    }
  }
  return false;
};

const removeDiacritics = (word: string): string => {
  return latinize(word);
};

export const standardizeText = (word: string): string => {
  return removeDiacritics(word.toLocaleLowerCase());
};
