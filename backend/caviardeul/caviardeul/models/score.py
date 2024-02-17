from django.db import models
from django.utils import timezone


class DailyArticleScore(models.Model):
    daily_article = models.ForeignKey("DailyArticle", on_delete=models.CASCADE)
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    nb_attempts = models.PositiveIntegerField()
    nb_correct = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                "daily_article", "user", name="daily_article_score_user_unq"
            )
        ]
