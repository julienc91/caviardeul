import pytest
from django.core.cache import cache

from caviardeul.exceptions import ArticleFetchError
from caviardeul.services.articles import (
    fetch_article,
    get_article_content,
    get_article_html_from_wikipedia,
)
from caviardeul.tests.factories import CustomArticleFactory, DailyArticleFactory

pytestmark = pytest.mark.django_db


class TestGetArticleHtmlFromWikipediaMetrics:
    async def test_success(self, mock_wiki_api, captured_metrics):
        mock_wiki_api("Guido", "Guido", "content")

        await get_article_html_from_wikipedia("Guido")

        assert ("count", "wikipedia.fetch", 1, None, {"status": "success"}) in (
            captured_metrics
        )
        [duration] = captured_metrics.named("wikipedia.fetch.duration")
        assert duration.unit == "millisecond"
        assert duration.attributes == {"status": "success"}

    async def test_error(self, mock_wiki_api_error, captured_metrics):
        mock_wiki_api_error("Guido")

        with pytest.raises(ArticleFetchError):
            await get_article_html_from_wikipedia("Guido")

        assert ("count", "wikipedia.fetch", 1, None, {"status": "error"}) in (
            captured_metrics
        )


class TestGetArticleContentMetrics:
    async def test_cache_miss_then_hit(self, mock_wiki_api, captured_metrics):
        article = await DailyArticleFactory.acreate(trait_current=True)
        mock_wiki_api(article.page_id, article.page_name, "content")

        await get_article_content(article)
        await get_article_content(article)

        assert captured_metrics.named("article.cache") == [
            ("count", "article.cache", 1, None, {"result": "miss"}),
            ("count", "article.cache", 1, None, {"result": "hit"}),
        ]


class TestFetchArticle:
    async def test_fetch_article(self, mock_wiki_api):
        mock_wiki_api("guido", "Guido van Rossum", "<p>content</p>")

        title, content = await fetch_article("guido")

        assert title == "Guido van Rossum"
        assert content == "<p>content</p>"
        assert await cache.aget("wikipedia::guido") == content


class TestGetArticleContent:
    async def test_shared_page_id_keeps_each_title(self, mock_wiki_api):
        daily_article = await DailyArticleFactory.acreate(
            trait_current=True, page_id="Pâris_(mythologie)", page_name="Pâris"
        )
        custom_article = await CustomArticleFactory.acreate(
            page_id="Pâris_(mythologie)", page_name="Pâris (mythologie)"
        )
        mock_wiki_api("Pâris_(mythologie)", "Pâris (mythologie)", "<p>content</p>")

        await fetch_article("Pâris_(mythologie)")

        assert (
            await get_article_content(daily_article) == "<h1>Pâris</h1><p>content</p>"
        )
        assert (
            await get_article_content(custom_article)
            == "<h1>Pâris (mythologie)</h1><p>content</p>"
        )
