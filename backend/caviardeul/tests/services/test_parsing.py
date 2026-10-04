from caviardeul.services.parsing import strip_html_article


def test_strip_html_article(resources_path):
    base = (resources_path / "guido.base.html").read_text()
    expected = (resources_path / "guido.parsed.html").read_text()

    assert strip_html_article(base) == expected.strip()


def test_strip_html_article_removes_comments():
    html_content = (
        '<div class="mw-parser-output"><!-- top --><p>Texte<!-- inline --></p>'
        '<map><area href="/wiki/X" /><!-- illegal element removed --></map></div>'
    )

    assert (
        strip_html_article(html_content)
        == '<p>Texte</p><map><area href="/wiki/X"></map>'
    )
