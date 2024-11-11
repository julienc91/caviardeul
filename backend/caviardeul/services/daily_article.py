from django.utils import timezone

from caviardeul.models import DailyArticle


def get_current_daily_article_id() -> int | None:
    article = (
        DailyArticle.objects.filter(date__lt=timezone.now()).order_by("-date").first()
    )
    return article.id if article else None
