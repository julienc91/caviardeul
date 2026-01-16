from datetime import timedelta

import pytest
from django.utils import timezone

from caviardeul.tasks import check_upcoming_daily_article
from caviardeul.tasks.daily_article import check_random_daily_article
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


class TestCheckRandomDailyArticle:
    async def test_check_random_article(self, mock_wiki_api):
        now = timezone.now()
        articles = [
            await DailyArticleFactory.acreate(
                trait_past=True, last_checked_at=now - timedelta(days=3)
            ),
            await DailyArticleFactory.acreate(trait_current=True, last_checked_at=None),
            await DailyArticleFactory.acreate(
                trait_future=True, last_checked_at=now - timedelta(days=1)
            ),
        ]

        for expected_article in [
            articles[1],
            articles[0],
            articles[2],
            articles[1],
            articles[0],
        ]:
            now = timezone.now()
            mock_wiki_api(
                expected_article.page_id, expected_article.page_name, "article content"
            )

            await expected_article.arefresh_from_db()
            assert (
                expected_article.last_checked_at is None
                or expected_article.last_checked_at < now
            )

            await check_random_daily_article.kiq()

            await expected_article.arefresh_from_db()
            assert expected_article.last_checked_at >= now

    async def test_check_random_article_error(self, mock_wiki_api_error, caplog):
        article = await DailyArticleFactory.acreate(trait_past=True)
        mock_wiki_api_error(article.page_id)

        await check_random_daily_article.kiq()
        assert f"ERROR Error when retrieving article {article.id}" in caplog.text, (
            caplog.text
        )

        await article.arefresh_from_db()
        assert article.last_checked_at is None

    async def test_check_random_article_no_article(self, caplog):
        await check_random_daily_article.kiq()
        assert "ERROR No article found" in caplog.text, caplog.text
