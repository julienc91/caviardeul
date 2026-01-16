from datetime import timedelta

from django.db.models import F, OrderBy
from django.utils import timezone

from caviardeul.broker import broker
from caviardeul.exceptions import ArticleFetchError
from caviardeul.models import DailyArticle
from caviardeul.services.articles import (
    get_article_html_from_wikipedia,
    set_article_last_checked_at,
)
from caviardeul.services.logging import logger


@broker.task(schedule=[{"interval": timedelta(hours=8)}])
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
        await set_article_last_checked_at(next_article)
        logger.info("Upcoming article fetched successfully")


@broker.task(schedule=[{"interval": timedelta(hours=6)}])
async def check_random_daily_article() -> None:
    article = await DailyArticle.objects.order_by(
        OrderBy(F("last_checked_at"), nulls_first=True)
    ).afirst()
    if not article:
        logger.error("No article found")
        return

    try:
        _ = await get_article_html_from_wikipedia(article.page_id)
    except ArticleFetchError:
        logger.exception(f"Error when retrieving article {article.id}", exc_info=True)
    else:
        await set_article_last_checked_at(article)
        logger.info(f"Article {article.id} fetched successfully")
