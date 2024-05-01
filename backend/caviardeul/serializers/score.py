from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from caviardeul.models import DailyArticleScore


class ArticleScoreCreateSerializer(serializers.Serializer):
    nb_attempts = serializers.IntegerField(min_value=1, required=True)
    nb_correct = serializers.IntegerField(min_value=1, required=True)
    article_id = serializers.CharField(required=True)
    custom = serializers.BooleanField(required=True)

    def validate(self, attrs):
        if attrs["nb_correct"] > attrs["nb_attempts"]:
            raise ValidationError()


class DailyArticleScoreSerializer(serializers.Serializer):
    def to_representation(self, instance: DailyArticleScore):
        return {
            "nbAttempts": instance.nb_attempts,
            "nbCorrect": instance.nb_correct,
        }
