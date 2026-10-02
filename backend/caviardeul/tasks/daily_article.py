import functools
from datetime import timedelta

import sentry_sdk
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


def _scheduled_task(monitor_slug: str, interval: timedelta):
    # Also upserts a Sentry cron monitor, alerting when the task stops running
    monitor_config = {
        "schedule": {
            "type": "interval",
            "value": int(interval.total_seconds() // 60),
            "unit": "minute",
        },
        "checkin_margin": 30,
        "max_runtime": 10,
    }

    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # A new monitor per run: it stores the check-in id on itself, so
            # sharing one between overlapping runs would mix up their check-ins
            with sentry_sdk.monitor(
                monitor_slug=monitor_slug, monitor_config=monitor_config
            ):
                return await func(*args, **kwargs)

        return broker.task(schedule=[{"interval": interval}])(wrapper)

    return decorator


@_scheduled_task("check-upcoming-daily-article", timedelta(hours=8))
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
        logger.exception("Error when retrieving upcoming article %s", next_article.id)
    else:
        await set_article_last_checked_at(next_article)
        logger.info("Upcoming article %s fetched successfully", next_article.id)


@_scheduled_task("check-random-daily-article", timedelta(hours=6))
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
        logger.exception("Error when retrieving article %s", article.id)
    else:
        await set_article_last_checked_at(article)
        logger.info("Article %s fetched successfully", article.id)
