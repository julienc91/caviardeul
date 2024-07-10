from datetime import timedelta

from django.db import transaction
from django.http import HttpRequest, HttpResponse
from django.utils import timezone
from ninja.errors import HttpError

from caviardeul.models import CustomArticle, DailyArticle, DailyArticleScore
from caviardeul.serializers.score import ArticleScoreCreateSchema
from caviardeul.services.authentication import OptionalAPIAuthentication
from caviardeul.services.user import create_user_for_request

from .api import api


@api.post("/scores", auth=OptionalAPIAuthentication(), response={204: None})
@transaction.atomic()
def post_article_score(
    request: HttpRequest, payload: ArticleScoreCreateSchema, response: HttpResponse
):
    now = timezone.now()
    try:
        if payload.custom:
            article = CustomArticle.objects.select_for_update().get(
                public_id=payload.article_id
            )
        else:
            article = DailyArticle.objects.select_for_update().get(
                id=payload.article_id, date__lte=now
            )
    except (CustomArticle.DoesNotExist, DailyArticle.DoesNotExist):
        raise HttpError(400, "L'article n'a pas été trouvé")

    if not request.auth.is_authenticated:
        create_user_for_request(request, response)

    nb_attempts = payload.nb_attempts
    nb_correct = payload.nb_correct

    stats = article.stats or {"distribution": {}}
    key = str(min(nb_attempts // 10, 500))
    stats["distribution"][key] = stats["distribution"].get(key, 0) + 1
    article.nb_winners += 1
    article.stats = stats

    if payload.custom:
        article.save(update_fields=["stats", "nb_winners"])
    else:
        if now - article.date < timedelta(days=1):
            article.nb_daily_winners += 1

        _, created = DailyArticleScore.objects.get_or_create(
            daily_article=article,
            user=request.auth,
            defaults={"nb_attempts": nb_attempts, "nb_correct": nb_correct},
        )
        if created:
            article.save(update_fields=["stats", "nb_winners", "nb_daily_winners"])
