import os
from pathlib import Path

import httpx
import pytest
from django.core.cache import cache


@pytest.fixture()
def resources_path():
    return Path(os.path.dirname(__file__)) / "resources"


@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()


@pytest.fixture()
def mock_wiki_api(httpx_mock):
    def inner(
        page_id: str,
        title: str,
        content: str,
    ):
        httpx_mock.add_response(
            url=httpx.URL(
                "https://fr.wikipedia.org/w/api.php",
                params={
                    "action": "parse",
                    "format": "json",
                    "prop": "text",
                    "formatversion": 2,
                    "origin": "*",
                    "page": page_id,
                },
            ),
            json={"parse": {"title": title, "text": content}},
        )

    return inner


@pytest.fixture()
def mock_wiki_api_redirect(httpx_mock):
    def inner(page_id: str, title: str):
        httpx_mock.add_response(
            url=httpx.URL(
                "https://fr.wikipedia.org/w/api.php",
                params={
                    "action": "parse",
                    "format": "json",
                    "prop": "text",
                    "formatversion": 2,
                    "origin": "*",
                    "page": page_id,
                },
            ),
            json={
                "parse": {
                    "title": title,
                    "text": (
                        '<div class="redirectMsg"><p>Rediriger vers :</p>'
                        '<ul class="redirectText"><li><a href="/wiki/foo" title="Foo">Foo</a></li></ul>'
                        "</div>"
                    ),
                }
            },
        )

    return inner


@pytest.fixture()
def mock_wiki_api_error(httpx_mock):
    def inner(page_id: str):
        httpx_mock.add_response(
            url=httpx.URL(
                "https://fr.wikipedia.org/w/api.php",
                params={
                    "action": "parse",
                    "format": "json",
                    "prop": "text",
                    "formatversion": 2,
                    "origin": "*",
                    "page": page_id,
                },
            ),
            json={"error": "unknown article"},
        )

    return inner
