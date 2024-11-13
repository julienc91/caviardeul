from django.utils import timezone

from caviardeul.models import DailyArticle


async def get_current_daily_article_id() -> int | None:
    article = await (
        DailyArticle.objects.filter(date__lt=timezone.now()).order_by("-date").afirst()
    )
    return article.id if article else None
