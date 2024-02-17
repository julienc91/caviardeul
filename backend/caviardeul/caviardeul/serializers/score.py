from rest_framework import serializers

from caviardeul.models import DailyArticleScore


class DailyArticleScoreSerializer(serializers.Serializer):
    def to_representation(self, instance: DailyArticleScore):
        return {
            "nbAttempts": instance.nb_attempts,
            "nbCorrect": instance.nb_correct,
        }
