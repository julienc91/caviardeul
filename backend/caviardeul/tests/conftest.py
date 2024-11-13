import contextlib
import os
from pathlib import Path
from unittest.mock import Mock, patch

import httpx
import pytest
from django.core.cache import cache
from django.db import connections


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


@pytest.fixture(autouse=True)
def fix_async_db(request):
    """
    https://github.com/pytest-dev/pytest-asyncio/issues/226#issuecomment-2225156564
    """
    if (
        request.node.get_closest_marker("asyncio") is None
        or request.node.get_closest_marker("django_db") is None
    ):
        # Only run for async tests that use the database
        yield
        return

    main_thread_local = connections._connections
    for conn in connections.all():
        conn.inc_thread_sharing()

    main_thread_default_conn = main_thread_local._storage.default
    main_thread_storage = main_thread_local._lock_storage

    @contextlib.contextmanager
    def _lock_storage():
        yield Mock(default=main_thread_default_conn)

    try:
        with patch.object(main_thread_default_conn, "close"):
            object.__setattr__(main_thread_local, "_lock_storage", _lock_storage)
            yield
    finally:
        object.__setattr__(main_thread_local, "_lock_storage", main_thread_storage)
