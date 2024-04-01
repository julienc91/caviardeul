from django.db import transaction
from rest_framework.exceptions import ValidationError
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import CreateModelMixin

from caviardeul.models import CustomArticle, DailyArticle, DailyArticleScore
from caviardeul.serializers.score import ArticleScoreCreateSerializer
from caviardeul.services.user import create_user_for_request


class ScoreViewSet(CreateModelMixin, GenericViewSet):
    lookup_field = "public_id"
    serializer_class = ArticleScoreCreateSerializer

    @transaction.atomic()
    def perform_create(self, serializer: ArticleScoreCreateSerializer):
        article_id = serializer.validated_data["article_id"]
        custom = serializer.validated_data["custom"]
        try:
            if custom:
                article = CustomArticle.objects.select_for_update().get(id=article_id)
            else:
                article = DailyArticle.objects.select_for_update().get(id=article_id)
        except (CustomArticle.DoesNotExist, DailyArticle.DoesNotExist):
            raise ValidationError("L'article n'a pas été trouvé")

        if not self.request.user.is_authenticated:
            create_user_for_request(self.request)

        nb_attempts = serializer.validated_data["nb_attempts"]
        nb_correct = serializer.validated_data["nb_correct"]

        stats = article.stats or {"distribution": {}}
        key = min(nb_attempts / 10, 500)
        stats["distribution"][key] = stats["distribution"].get(key, 0) + 1
        article.nb_winners += 1
        article.stats = stats

        if custom:
            article.save(update_fields=["stats", "nb_winners"])
        else:
            article.nb_daily_winners += 1
            article.save(update_fields=["stats", "nb_winners", "nb_daily_winners"])

            DailyArticleScore.objects.get_or_create(
                daily_article=article,
                user=self.request.user,
                nb_attempts=nb_attempts,
                nb_correct=nb_correct,
            )

    def create(self, request, *args, **kwargs):
        is_authenticated = request.user.is_authenticated
        response = super().create(request, *args, **kwargs)
        if not is_authenticated and response.status_code == 201:
            response.set_cookie("userId", request.user.id)
        return response