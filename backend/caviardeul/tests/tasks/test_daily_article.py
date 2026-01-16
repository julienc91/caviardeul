import pytest

from caviardeul.tasks import check_upcoming_daily_article
from caviardeul.tests.factories import DailyArticleFactory

pytestmark = pytest.mark.django_db


class TestCheckUpcomingDailyArticle:
    async def test_no_upcoming_article(self, caplog):
        await DailyArticleFactory.acreate(trait_past=True)
        await DailyArticleFactory.acreate(trait_current=True)

        await check_upcoming_daily_article.kiq()
        assert "ERROR No upcoming article found" in caplog.text, caplog.text

    async def test_check_upcoming_article_valid(self, mock_wiki_api, caplog):
        await DailyArticleFactory.acreate(trait_past=True)
        await DailyArticleFactory.acreate(trait_current=True)
        expected_article = await DailyArticleFactory.acreate(trait_future=True)

        mock_wiki_api(
            expected_article.page_id, expected_article.page_name, "article content"
        )

        await check_upcoming_daily_article.kiq()
        assert "INFO Upcoming article fetched successfully" in caplog.text, caplog.text

    async def test_check_upcoming_article_error(self, mock_wiki_api_error, caplog):
        await DailyArticleFactory.acreate(trait_past=True)
        await DailyArticleFactory.acreate(trait_current=True)
        expected_article = await DailyArticleFactory.acreate(trait_future=True)

        mock_wiki_api_error(expected_article.page_id)

        await check_upcoming_daily_article.kiq()
        assert "ERROR Error when retrieving upcoming article" in caplog.text, (
            caplog.text
        )

    async def test_check_upcoming_article_redirect(
        self, mock_wiki_api_redirect, caplog
    ):
        await DailyArticleFactory.acreate(trait_past=True)
        await DailyArticleFactory.acreate(trait_current=True)
        expected_article = await DailyArticleFactory.acreate(trait_future=True)

        mock_wiki_api_redirect(expected_article.page_id, expected_article.page_name)

        await check_upcoming_daily_article.kiq()
        assert "ERROR Error when retrieving upcoming article" in caplog.text, (
            caplog.text
        )
