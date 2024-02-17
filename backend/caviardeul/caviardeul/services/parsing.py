from bs4 import BeautifulSoup

elements_to_remove = [
    "audio",
    "video",
    "figure",
    "img",
    "iframe",
    # ---
    "#toc",
    ".API.nowrap",  # Phonetical pronunciation
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
    ".indicateur-langue",  # Link to page in another language
    ".reference",
    ".reference-cadre",
    ".thumb",
    ".wikitable",
    "style",
    "sup.reference",
]

elements_to_strip_after = [
    "h2 #Annexes",
    "h2 #Bibliographie",
    "h2 #Notes_et_références",
    "h2 #Notes",
    "h2 #Références",
    "h2 #Voir_aussi",
    "h3 #Notes_et_références",
]

elements_to_flatten = [
    "a",
    "abbr",
    "b",
    "i",
    "em",
    "span",
    "strong",
    "sup",
    "time",
]


def strip_html_article(html_content: str) -> str:
    soup = BeautifulSoup(html_content, "html.parser")
    for element in soup.find_all(elements_to_remove):
        element.decompose()

    for selector in elements_to_strip_after:
        if not (element := soup.find(selector)):
            continue

        element = element.parent
        for sibling in element.next_siblings:
            sibling.decompose()
        element.decompose()

    for element in soup.find_all(elements_to_flatten):
        element.replace_with(element.text)

    for element in soup.find_all(".mw-parser-output"):
        element.replace_with(element.decode_contents())

    element = soup.find("#Voir_aussi")
    if element:
        element.closest("h2").decompose()

    return str(soup)
