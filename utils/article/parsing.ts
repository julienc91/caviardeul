import { parse } from "node-html-parser";

const elementsToRemove = [
  "audio",
  "video",
  "figure",
  "img",
  "iframe",
  //
  "#toc",
  ".API.nowrap", // Phonetical pronunciation
  ".gallery",
  ".hatnote",
  ".infobox",
  ".infobox_v2",
  ".infobox_v3",
  ".metadata",
  ".mw-editsection",
  ".mw-empty-elt",
  ".noprint",
  ".bandeau-portail",
  ".indicateur-langue", // Link to page in another language
  ".reference",
  ".reference-cadre",
  ".thumb",
  ".wikitable",
  "style",
  "sup.reference",
];
const elementsToStripAfter = [
  "h2 #Annexes",
  "h2 #Bibliographie",
  "h2 #Notes_et_références",
  "h2 #Notes",
  "h2 #Références",
  "h2 #Voir_aussi",
  "h3 #Notes_et_références",
];
const elementsToFlatten = [
  "a",
  "abbr",
  "b",
  "i",
  "em",
  "span",
  "strong",
  "sup",
  "time",
];

/**
 * Remove extra elements from the Wikipedia article. Only remaining HTML tags after stripping are:
 * <p>, <blockquote>, <h1>, <h2>, <h3>, <h4>, <ul>, <li>
 * @param rawContent The raw HTML content of the Wikipedia article
 */
export const stripArticle = (rawContent: string): string => {
  let content = parse(rawContent);
  content?.querySelectorAll(elementsToRemove.join(",")).forEach((element) => {
    element.remove();
  });

  elementsToStripAfter.forEach((selector) => {
    const element = content?.querySelector(selector)?.parentNode;
    while (element?.nextElementSibling) {
      element?.nextElementSibling.remove();
    }
    element?.remove();
  });

  content?.querySelectorAll(elementsToFlatten.join(",")).forEach((element) => {
    element.replaceWith(element.innerText);
  });

  content?.querySelectorAll(".mw-parser-output").forEach((element) => {
    element.replaceWith(element.innerHTML);
  });

  content?.querySelector("#Voir_aussi")?.closest("h2")?.remove();
  return (content || "").toString();
};
