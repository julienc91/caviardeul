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

export const splitWords = (text: string): string[] => {
  return text.split(separatorRegex);
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

export const countOccurrences = (word: string, text: string): number => {
  text = standardizeText(text);
  const allowedSuffixes = `(${closeAlternativesSuffixes.join("|")})?`;
  const regex = new RegExp(
    `\([${punctuationList}]|^)(${word})${allowedSuffixes}([${punctuationList}]|$)`,
    "gim",
  );
  const matches = Array.from(text.matchAll(regex));
  let count = matches.length;

  // Substract matches of the related common words, if they exist
  const relatedCommonWords = getRelatedCommonWords(word);
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
 * Determine if a word is currently selected
 * @param word
 * @param selection
 */
export const isSelected = (word: string, selection: string): boolean => {
  if (word === selection) {
    return true;
  } else {
    return buildAlternatives(selection).some(
      (alternative) => alternative === word,
    );
  }
};

const removeDiacritics = (word: string): string => {
  return latinize(word);
};

export const standardizeText = (word: string): string => {
  return removeDiacritics(word.toLocaleLowerCase());
};
