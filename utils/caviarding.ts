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
  const splittedText = text.split(separatorRegex);
  const result = [];

  if (splittedText.length >= 3) {
    for (let i = 0; i < splittedText.length - 2; i++) {
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
