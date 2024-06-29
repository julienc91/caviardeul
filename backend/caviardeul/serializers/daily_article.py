from rest_framework import serializers

from caviardeul.constants import Safety
from caviardeul.models import DailyArticle
from caviardeul.serializers.score import DailyArticleScoreSerializer
from caviardeul.services.articles import get_article_content
from caviardeul.services.encryption import encrypt_data, generate_encryption_key


class _BaseDailyArticleSerializer(serializers.Serializer):
    def to_representation(self, instance: DailyArticle):
        user_score = None
        if article_score := getattr(instance, "user_score", None):
            user_score = DailyArticleScoreSerializer(article_score).data

        stats = DailyArticleStatsSerializer(instance).data
        return {
            "articleId": instance.id,
            "archive": not self.context["current"],
            "custom": False,
            "safety": Safety.SAFE,
            "userScore": user_score,
            "stats": stats,
        }


class DailyArticleListSerializer(_BaseDailyArticleSerializer):
    def to_representation(self, instance: DailyArticle):
        data = super().to_representation(instance)
        data["pageName"] = instance.page_name if data["userScore"] is not None else None
        return data


class DailyArticleDetailSerializer(_BaseDailyArticleSerializer):
    def to_representation(self, instance: DailyArticle):
        data = super().to_representation(instance)
        content = get_article_content(instance)
        key = generate_encryption_key()
        encrypted_page_name = encrypt_data(instance.page_name, key)
        encrypted_content = encrypt_data(content, key)

        data["key"] = key
        data["pageName"] = encrypted_page_name
        data["content"] = encrypted_content
        return data


class DailyArticleStatsSerializer(serializers.Serializer):
    def _get_difficulty_category_from_median_attempts(self, median: int) -> int:
        if median < 30:
            return 0
        elif median < 75:
            return 1
        elif median < 125:
            return 2
        elif median < 200:
            return 3
        return 4

    def to_representation(self, instance: DailyArticle):
        if not instance.stats.get("distribution"):
            return {
                "median": 0,
                "nbWinners": 0,
                "category": 0,
            }

        distribution = instance.stats["distribution"]
        index = instance.nb_winners // 2
        median = 10
        categories = [int(key) for key in distribution.keys()]
        for category in sorted(categories):
            index -= distribution[str(category)]
            if index <= 0:
                median = category * 10
                break
        return {
            "median": median,
            "nbWinners": instance.nb_winners,
            "category": self._get_difficulty_category_from_median_attempts(median),
        }
