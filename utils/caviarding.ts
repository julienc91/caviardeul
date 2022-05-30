import latinize from "latinize";

export const commonWords = new Set<string>([
  "a",
  "ainsi",
  "alors",
  "apres",
  "autour",
  "avant",
  "avec",
  "au",
  "aux",
  "c",
  "ca",
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

const punctuationList = "{}()\\[\\]\\\\.,;:!¡?¿/@#%\\^&*_~+\\-=<>«»\"'\\s";
const wordRegex = new RegExp(`^[^${punctuationList}]+$`, "i");
const separatorRegex = new RegExp(`([${punctuationList}]+)`, "gim");

export const splitWords = (text: string): string[] => {
  return text.split(separatorRegex);
};

export const isWord = (word: string): boolean => {
  return !!word.match(wordRegex);
};

export const countOccurrences = (text: string, word: string): number => {
  const standardizedWord = standardizeText(word);
  const regex = new RegExp(
    `\([${punctuationList}]|^)(${standardizedWord})([${punctuationList}]|$)`,
    "gim"
  );
  const matches = Array.from(text.matchAll(regex));
  return matches.length;
};

const removeDiacritics = (word: string): string => {
  return latinize(word);
};

export const standardizeText = (word: string): string => {
  return removeDiacritics(word.toLocaleLowerCase());
};
