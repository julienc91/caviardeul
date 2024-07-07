from collections import defaultdict

from django.core.management.base import BaseCommand

from caviardeul.models import DailyArticle, DailyArticleScore


class Command(BaseCommand):
    def handle(self, *args, **options):
        for daily_article in DailyArticle.objects.defer("stats").all():
            scores = DailyArticleScore.objects.filter(daily_article=daily_article)
            stats = daily_article.stats.get("distribution", {})

            fixed_stats = defaultdict(int)
            for score in scores:
                key = str(min(score.nb_attempts // 10, 500))
                fixed_stats[key] += 1

            for key in fixed_stats:
                if fixed_stats[key] < stats.get(key, 0):
                    fixed_stats[key] = stats[key]

            daily_article.stats = {"distribution": stats | fixed_stats}
            daily_article.save(update_fields=["stats"])
