from bs4 import BeautifulSoup, Comment, NavigableString

elements_to_remove = [
    "audio",
    "video",
    "figure",
    "img",
    "iframe",
    "meta",
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
    ".toc",
    ".wikitable",
    "style",
    "sup.reference",
]

elements_to_strip_after = [
    "h2#Annexes",
    "h2#Bibliographie",
    "h2#Notes_et_références",
    "h2#Notes",
    "h2#Références",
    "h2#Voir_aussi",
    "h3#Notes_et_références",
    # --- Old format
    "h2 #Annexes",
    "h2 #Bibliographie",
    "h2 #Notes_et_références",
    "h2 #Notes",
    "h2 #Références",
    "h2 #Voir_aussi",
    "h3 #Notes_et_références",
]

elements_to_replace_with_children = [
    ".mw-heading",
    ".mw-parser-output",
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
    for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
        comment.extract()

    for selector in elements_to_remove:
        for element in soup.select(selector):
            element.decompose()

    for selector in elements_to_strip_after:
        if not (element := soup.select_one(selector)):
            continue

        element = element.parent
        for sibling in list(element.next_siblings):
            if isinstance(sibling, NavigableString):
                sibling.extract()
            else:
                sibling.decompose()
        element.decompose()

    for selector in elements_to_flatten:
        for element in soup.select(selector):
            value = element.get_text()
            element.replace_with(value)

    for selector in elements_to_replace_with_children:
        for element in soup.select(selector):
            element.replace_with_children()

    element = soup.select_one("#Voir_aussi")
    if element:
        try:
            element.closest("h2").decompose()
        except TypeError:
            element.decompose()

    return str(soup).replace("\\n", "\n").strip()
