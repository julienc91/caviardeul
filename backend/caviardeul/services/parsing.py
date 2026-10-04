from selectolax.lexbor import LexborHTMLParser

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
    tree = LexborHTMLParser(html_content)
    for node in list(tree.body.traverse()):
        if node.is_comment_node:
            node.decompose()

    for selector in elements_to_remove:
        for node in tree.css(selector):
            node.decompose()

    for selector in elements_to_strip_after:
        if not (node := tree.css_first(selector)):
            continue

        node = node.parent
        sibling = node.next
        while sibling is not None:
            next_sibling = sibling.next
            sibling.decompose()
            sibling = next_sibling
        node.decompose()

    for selector in elements_to_flatten:
        for node in tree.css(selector):
            node.replace_with(node.text())

    for selector in elements_to_replace_with_children:
        for node in tree.css(selector):
            node.unwrap()

    if node := tree.css_first("#Voir_aussi"):
        heading = node
        while heading is not None and heading.tag != "h2":
            heading = heading.parent
        (heading or node).decompose()

    return tree.body.inner_html.replace("\\n", "\n").replace("&nbsp;", "\xa0").strip()
