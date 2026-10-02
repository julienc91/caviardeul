import pytest

from caviardeul.tasks.daily_article import check_random_daily_article
from caviardeul.tests.factories import DailyArticleFactory

pytestmark = pytest.mark.django_db

TASK_NAME = "caviardeul.tasks.daily_article:check_random_daily_article"


class TestTaskMetricsMiddleware:
    async def test_success(self, captured_metrics):
        await check_random_daily_article.kiq()

        [metric] = captured_metrics.named("task.duration")
        assert metric.type == "distribution"
        assert metric.value >= 0
        assert metric.unit == "millisecond"
        assert metric.attributes == {"task": TASK_NAME, "status": "success"}

    async def test_error(self, monkeypatch, captured_metrics):
        await DailyArticleFactory.acreate(trait_past=True)

        async def fail(_page_id):
            raise RuntimeError("Unexpected")

        monkeypatch.setattr(
            "caviardeul.tasks.daily_article.get_article_html_from_wikipedia", fail
        )

        await check_random_daily_article.kiq()

        [metric] = captured_metrics.named("task.duration")
        assert metric.attributes == {"task": TASK_NAME, "status": "error"}
