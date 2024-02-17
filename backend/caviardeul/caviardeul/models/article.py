from django.db import models
from django.utils import timezone
from caviardeul.constants import Safety


class Article(models.Model):
    class Meta:
        abstract = True

    page_id = models.CharField(max_length=256)
    page_name = models.CharField(max_length=256)
    nb_winners = models.PositiveIntegerField()
    stats = models.JSONField()


class DailyArticle(Article):
    date = models.DateTimeField()
    nb_daily_winners = models.PositiveIntegerField()

    class Meta:
        indexes = [
            models.Index("date", name="daily_article_date_idx"),
        ]
        constraints = [
            models.UniqueConstraint("date", name="daily_article_date_unq"),
            models.UniqueConstraint("page_id", name="daily_article_page_id_unq"),
        ]


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
        ]
