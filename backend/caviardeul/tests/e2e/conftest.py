import random
from datetime import timedelta

import pytest
from django.core.cache import cache
from django.utils import timezone
from playwright.async_api import Page

from caviardeul.tests.e2e.server import backend_server, frontend_server
from caviardeul.tests.factories import DailyArticleFactory, UserFactory


def pytest_collection_modifyitems(items):
    for item in items:
        if "/e2e/" in str(item.fspath):
            item.add_marker(pytest.mark.e2e)
            item.add_marker(pytest.mark.django_db(transaction=True))


@pytest.fixture(scope="session")
def live_server(django_db_setup, django_db_blocker):
    yield from backend_server(django_db_blocker)


@pytest.fixture(scope="session")
def _frontend_server(live_server):
    yield from frontend_server(live_server)


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args, _frontend_server):
    return {**browser_context_args, "locale": "fr-FR"}


@pytest.fixture(autouse=True)
async def clear_cache():
    await cache.aclear()


@pytest.fixture
async def skip_tutorial_page(page: Page) -> Page:
    await page.add_init_script("localStorage.setItem('skipTutorial', 'true')")
    return page


@pytest.fixture
def login(context):
    async def _login(user):
        await context.add_cookies(
            [
                {
                    "name": "userId",
                    "value": str(user.id),
                    "domain": "localhost",
                    "path": "/",
                },
            ]
        )

    return _login


# ---------------------------------------------------------------------------
# Data fixtures — each test requests only the fixtures it needs.
# With django_db(transaction=True), data is committed (visible to LiveServer)
# and truncated after each test.
# ---------------------------------------------------------------------------


async def _seed_article_cache(
    page_id: str, page_name: str, html_body: str | None = None
):
    if html_body is None:
        html_body = (
            f"<p>{page_name} est un article de test pour les tests end-to-end de Caviardeul.</p>"
            '<h2 id="Section">Section</h2>'
            f"<p>Contenu de test pour {page_name}.</p>"
        )
    await cache.aset(
        f"wikipedia::{page_id}", f"<h1>{page_name}</h1>{html_body}", timeout=86400
    )


@pytest.fixture
async def daily_article(resources_path):
    article = await DailyArticleFactory.acreate(
        trait_current=True,
        page_id="Guido_van_Rossum",
        page_name="Guido van Rossum",
        nb_winners=0,
        nb_daily_winners=0,
    )
    content = (resources_path / "guido.parsed.html").read_text()
    await _seed_article_cache("Guido_van_Rossum", "Guido van Rossum", content)
    return article


@pytest.fixture
async def past_articles():
    now = timezone.now()
    articles = []
    date = now - timedelta(days=1)
    for title in [
        "Python (langage)",
        "Tour Eiffel",
        "Marie Curie",
        "Lune",
        "Missak Manouchian",
    ]:
        median = random.randint(10, 100)
        nb_winners = 100
        article = await DailyArticleFactory.acreate(
            page_name=title,
            page_id=title.replace(" ", "_"),
            date=date,
            median=median,
            stats={"distribution": {str(median): nb_winners}},
        )
        date -= timedelta(days=1)
        articles.append(article)
        await _seed_article_cache(article.page_id, article.page_name)
    return articles


@pytest.fixture
async def user1():
    return await UserFactory.acreate()
