import latinize from "latinize";

const commonWords = new Set<string>([
  "לא",
  "כן",
  "היה",
  "עם",
  "אם",
  "זה",
  "בין",
  "עד",
  "יותר",
  "אחרי",
  "כי",
  "אלה",
  "כפי",
  "אבל",
  "על",
  "אל",
  "של",
  "מה",
  "מי",
  "או",
  "גם",
  "וגם",
  "הוא",
  "את",
  "זו",
  "אצל",
  "כמו"
]);

const punctuationList = "{}()\\[\\]\\\\.…,;:!¡?¿/@#%\\^&*_~+\\-=<>«»\"'’\\s";
const wordRegex = new RegExp(`^[^${punctuationList}]+$`, "i");
const separatorRegex = new RegExp(`([${punctuationList}]+)`, "gim");

export const splitWords = (
  text: string,
  isMarkdown: boolean = false
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
    (commonWord) => word === standardizeText(commonWord)
  );
};

export const countOccurrences = (
  text: string,
  standardizedText: string,
  word: string
): number => {
  if (isCommonWord(word)) {
    throw new Error(`Cannot count occurrences of common word: ${word}`);
  }

  const standardizedWord = standardizeText(word);
  const regex = new RegExp(
    `\([${punctuationList}]|^)(${standardizedWord})([${punctuationList}]|$)`,
    "gim"
  );
  const matches = Array.from(standardizedText.matchAll(regex));
  let count = matches.length;

  // Substract matches of the related common words, if they exist
  const relatedCommonWords = getRelatedCommonWords(standardizedWord);
  count -= relatedCommonWords
    .map((commonWord) => {
      const regex = new RegExp(
        `\([${punctuationList}]|^)(${commonWord})([${punctuationList}]|$)`,
        "gim"
      );
      return Array.from(text.matchAll(regex)).length;
    })
    .reduce((a, b) => a + b, 0);
  return count;
};

const removeDiacritics = (word: string): string => {
  return latinize(word);
};

export const standardizeText = (word: string): string => {
  return removeDiacritics(word.toLocaleLowerCase());
};
