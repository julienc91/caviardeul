import pytest

from caviardeul.exceptions import ArticleFetchError
from caviardeul.services.articles import (
    get_article_content,
    get_article_html_from_wikipedia,
)
from caviardeul.tests.factories import DailyArticleFactory

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
