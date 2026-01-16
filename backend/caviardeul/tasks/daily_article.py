from django.utils import timezone

from caviardeul.broker import broker
from caviardeul.exceptions import ArticleFetchError
from caviardeul.models import DailyArticle
from caviardeul.services.articles import get_article_html_from_wikipedia
from caviardeul.services.logging import logger


@broker.task(schedule=[{"cron": "* */8 * * *"}])
async def check_upcoming_daily_article() -> None:
    now = timezone.now()
    next_article = (
        await DailyArticle.objects.filter(date__gt=now).order_by("date").afirst()
    )

    if not next_article:
        logger.error("No upcoming article found")
        return

    try:
        _ = await get_article_html_from_wikipedia(next_article.page_id)
    except ArticleFetchError:
        logger.exception("Error when retrieving upcoming article", exc_info=True)
    else:
        logger.info("Upcoming article fetched successfully")
