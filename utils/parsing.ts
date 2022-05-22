import TurndownService from "turndown";
import { parse } from "node-html-parser";

const turndownService = new TurndownService();

export const convertToMarkdown = (htmlContent: string): string => {
  return turndownService.turndown(htmlContent);
};

const elementsToRemove = [
  "audio",
  "video",
  "img",
  "iframe",
  //
  "#toc",
  ".hatnote",
  ".infobox",
  ".mw-empty-elt",
  ".noprint",
  ".API.nowrap", // Phonetical pronunciation
  ".metadata",
  ".mw-editsection",
  ".reference",
  ".reference-cadre",
  ".thumb",
  "style",
  "sup.reference",
];
const elementsToStripAfter = ["#Voir_aussi", "#Notes_et_références"];
const elementsToFlatten = ["a", "abbr", "b", "i", "span", "sup", "time"];

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
