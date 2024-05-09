from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from caviardeul.models import DailyArticleScore


class ArticleScoreCreateSerializer(serializers.Serializer):
    nb_attempts = serializers.IntegerField(min_value=1, required=True)
    nb_correct = serializers.IntegerField(min_value=1, required=True)
    article_id = serializers.CharField(required=True)
    custom = serializers.BooleanField(required=True)

    def to_internal_value(self, data):
        if "nbAttempts" in data:
            data["nb_attempts"] = data.pop("nbAttempts")
        if "nbCorrect" in data:
            data["nb_correct"] = data.pop("nbCorrect")
        if "articleId" in data:
            data["article_id"] = data.pop("articleId")
        return super().to_internal_value(data)

    def validate(self, attrs):
        if attrs["nb_correct"] > attrs["nb_attempts"]:
            raise ValidationError()
        return super().validate(attrs)


class DailyArticleScoreSerializer(serializers.Serializer):
    def to_representation(self, instance: DailyArticleScore):
        return {
            "nbAttempts": instance.nb_attempts,
            "nbCorrect": instance.nb_correct,
        }
