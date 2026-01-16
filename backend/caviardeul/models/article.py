from datetime import timedelta

from django.db import models
from django.utils import timezone

from caviardeul.constants import Safety


class Article(models.Model):
    class Meta:
        abstract = True

    page_id = models.CharField(max_length=256)
    page_name = models.CharField(max_length=256)
    nb_winners = models.PositiveIntegerField()
    median = models.PositiveIntegerField()
    stats = models.JSONField()


class DailyArticle(Article):
    date = models.DateTimeField()
    nb_daily_winners = models.PositiveIntegerField()
    last_checked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index("date", name="daily_article_date_idx"),
            models.Index("last_checked_at", name="daily_article_last_check_idx"),
        ]
        constraints = [
            models.UniqueConstraint("date", name="daily_article_date_unq"),
            models.UniqueConstraint("page_id", name="daily_article_page_id_unq"),
        ]

    def get_absolute_url(self):
        now = timezone.now()
        if self.date < now - timedelta(days=1):
            return f"/archives/{self.id}"
        elif self.date < now:
            return "/"
        return None


class CustomArticle(Article):
    public_id = models.CharField(max_length=32)
    created_by = models.ForeignKey("User", on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    safety = models.CharField(
        choices=Safety.choices, default=Safety.UNKNOWN, max_length=16
    )

    class Meta:
        indexes = [models.Index("public_id", name="custom_article_public_id_idx")]
        constraints = [
            models.UniqueConstraint(
                "page_id", "created_by", name="custom_article_page_id_creator_unq"
            ),
            models.UniqueConstraint("public_id", name="custom_article_public_id_unq"),
        ]

    def get_absolute_url(self):
        return f"/custom/{self.public_id}"
