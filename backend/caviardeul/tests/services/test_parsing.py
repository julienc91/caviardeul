from caviardeul.services.parsing import strip_html_article


def test_strip_html_article(resources_path):
    base = (resources_path / "guido.base.html").read_text()
    expected = (resources_path / "guido.parsed.html").read_text()

    assert strip_html_article(base) == expected.strip()
