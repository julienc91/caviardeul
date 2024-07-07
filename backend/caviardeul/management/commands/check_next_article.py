from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from caviardeul.exceptions import ArticleFetchError
from caviardeul.models import DailyArticle
from caviardeul.services.articles import get_article_html_from_wikipedia


class Command(BaseCommand):
    def handle(self, *args, **options):
        now = timezone.now()
        next_article = (
            DailyArticle.objects.filter(date__gt=now).order_by("date").first()
        )
        if not next_article:
            raise CommandError("No daily article left")

        try:
            title, text = get_article_html_from_wikipedia(next_article.page_id)
        except ArticleFetchError:
            raise CommandError("Error when retrieving daily article")

        if "redirectMsg" in text:
            raise CommandError("Next daily article has a redirect")
