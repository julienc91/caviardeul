from rest_framework import serializers
from rest_framework.exceptions import ValidationError


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

    def to_representation(self, instance):
        res = super().to_representation(instance)
        article_id = res["article_id"] if res["custom"] else int(res["article_id"])
        return {
            "nbAttempts": res["nb_attempts"],
            "nbCorrect": res["nb_correct"],
            "articleId": article_id,
            "custom": res["custom"],
        }
