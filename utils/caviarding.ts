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
  "היא",
  "את",
  "זו",
  "אצל",
  "כמו",
  "ה",
  "ב",
  "ל",
  "כ",
  "ו",
  "מ",
  "ש",
]);


const punctuationListWithoutQuotes = "–{}()\\[\\]\\\\.…,;:!¡?¿/@#%\\^&*_~+\\-=<>«»\\s";
const punctuationList = `${punctuationListWithoutQuotes}\"`;
const wordRegex = new RegExp(`^[^${punctuationListWithoutQuotes}]+$`, "i");
const separatorRegex = new RegExp(`([${punctuationListWithoutQuotes}]+|(?<![א-ת])\"(?![א-ת])|\"+$|^\"+|(?<=[א-ת])\"+(?=[${punctuationListWithoutQuotes}])|(?<=[${punctuationListWithoutQuotes}])\"|(?<=[${punctuationListWithoutQuotes}][הב])\"|(?<=^[הב])\")`, "gim");
export const closeAlternativesSuffixes = ["ים", "ות"];
export const closeAlternativesPrefixes = ["ב","ה","מ","כ","ש","ו","ל"];

export const splitWords = (
  text: string,
  isMarkdown: boolean = false
): string[] => {
  const splittedText = text.split(separatorRegex).filter(s => s?.length);
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
  word: string,
  withCloseAlternatives: boolean
): number => {
  if (isCommonWord(word)) {
    throw new Error(`Cannot count occurrences of common word: ${word}`);
  }

  const standardizedWord = standardizeText(word);
  const allowedPrefixes = withCloseAlternatives
    ? `(${closeAlternativesPrefixes.join("|")})?`
    : "";
  const allowedSuffixes = withCloseAlternatives
    ? `(${closeAlternativesSuffixes.join("|")})?`
    : "";    
  const regex = new RegExp(
    `\([${punctuationList}]|^)(${allowedPrefixes}${standardizedWord})${allowedSuffixes}([${punctuationList}]|$)`,
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

/**
 * Build a list of words that are considered close enough to the given word
 * to be revealed simultaneously.
 * @param standardizedWord
 */
export const buildAlternatives = (standardizedWord: string): string[] =>
  [
    ...closeAlternativesPrefixes.map((prefix) => `${prefix}${standardizedWord}`),
    ...closeAlternativesSuffixes.map((suffix) => `${standardizedWord}${suffix}`),
  ];

/**
 * Determine if a word (assumed not to be from the common word set) should be revealed
 * or not.
 * @param word
 * @param revealedWords
 */
export const isRevealed = (
  word: string,
  revealedWords: Set<string>
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
  withCloseAlternatives: boolean
): boolean => {
  const standardizedWord = standardizeText(word);
  if (standardizedWord === selection) {
    return true;
  }
  if (withCloseAlternatives) {
    if (
      buildAlternatives(selection).some(
        (alternative) => alternative === standardizedWord
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
