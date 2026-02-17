import contextlib
import os
from pathlib import Path
from unittest.mock import Mock, patch

import httpx
import pytest
from django.core.cache import cache
from django.db import connections


def pytest_configure(config):
    if "e2e" not in (config.option.markexpr or ""):
        return

    # Disable socket restrictions from pyproject.toml addopts.
    # pytest-socket caches these in its own pytest_configure, so we must
    # override the cached attributes, not just config.option.
    config.__socket_disabled = False
    config.__socket_allow_hosts = None

    # Session-scoped asyncio loop for e2e tests
    config.inicfg["asyncio_default_fixture_loop_scope"] = "session"
    config.inicfg["asyncio_default_test_loop_scope"] = "session"
    # Also update the ini cache since pytest-asyncio reads these during its
    # own pytest_configure, which runs before conftest hooks.
    if hasattr(config, "_inicache"):
        config._inicache["asyncio_default_fixture_loop_scope"] = "session"
        config._inicache["asyncio_default_test_loop_scope"] = "session"

    # Playwright defaults
    if not getattr(config.option, "browser", None):
        config.option.browser = ["chromium"]
    if not getattr(config.option, "base_url", None):
        config.option.base_url = "http://localhost:3000"
    if getattr(config.option, "screenshot", None) in (None, "off"):
        config.option.screenshot = "only-on-failure"
    if getattr(config.option, "tracing", None) in (None, "off"):
        config.option.tracing = "retain-on-failure"
    if not getattr(config.option, "output", None):
        config.option.output = "test-results"


@pytest.hookimpl(trylast=True)
def pytest_collection_modifyitems(config, items):
    if "e2e" in (config.option.markexpr or ""):
        return
    remaining = []
    deselected = []
    for item in items:
        if "e2e" in item.keywords:
            deselected.append(item)
        else:
            remaining.append(item)
    if deselected:
        config.hook.pytest_deselected(items=deselected)
        items[:] = remaining


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
