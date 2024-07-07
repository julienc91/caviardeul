import os
from pathlib import Path

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
            url=(
                "https://fr.wikipedia.org/w/api.php?action=parse&format=json&"
                f"page={page_id}&prop=text&formatversion=2&origin=*"
            ),
            json={"parse": {"title": title, "text": content}},
        )

    return inner


@pytest.fixture()
def mock_wiki_api_error(httpx_mock):
    def inner(page_id: str):
        httpx_mock.add_response(
            url=(
                "https://fr.wikipedia.org/w/api.php?action=parse&format=json&"
                f"page={page_id}&prop=text&formatversion=2&origin=*"
            ),
            json={"error": "unknown article"},
        )

    return inner
