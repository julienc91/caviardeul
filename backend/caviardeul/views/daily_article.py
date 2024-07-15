from django.contrib.auth.models import AnonymousUser
from django.db.models import BooleanField, FilteredRelation, Q, Value
from django.http import Http404, HttpRequest
from django.utils import timezone
from ninja import Query

from caviardeul.models import DailyArticle, User
from caviardeul.serializers.daily_article import (
    DailyArticleListFilter,
    DailyArticleListSchema,
    DailyArticleSchema,
)
from caviardeul.services.articles import get_article_content
from caviardeul.services.authentication import OptionalAPIAuthentication

from .api import api


def _get_queryset(user: User | AnonymousUser):
    queryset = DailyArticle.objects.filter(date__lte=timezone.now())
    if user.is_authenticated:
        queryset = queryset.annotate(
            user_score=FilteredRelation(
                "dailyarticlescore",
                condition=Q(dailyarticlescore__user=user),
            )
        ).select_related("user_score")
    else:
        queryset = queryset.annotate(
            user_score=Value(None, output_field=BooleanField())
        )
    return queryset


@api.get(
    "/articles/current", auth=OptionalAPIAuthentication(), response=DailyArticleSchema
)
def get_current_article(request: HttpRequest):
    try:
        article = _get_queryset(request.auth).order_by("-date")[:1].get()
    except DailyArticle.DoesNotExist:
        raise Http404("L'article n'a pas été trouvé")

    article.content = get_article_content(article)
    return article


@api.get(
    "/articles/{article_id}",
    auth=OptionalAPIAuthentication(),
    response=DailyArticleSchema,
)
def get_archived_article(request: HttpRequest, article_id: int):
    try:
        article = _get_queryset(request.auth).get(id=article_id)
    except DailyArticle.DoesNotExist:
        raise Http404("L'article n'a pas été trouvé")

    article.content = get_article_content(article)
    return article


@api.get(
    "/articles", auth=OptionalAPIAuthentication(), response=list[DailyArticleListSchema]
)
def list_archived_articles(
    request: HttpRequest, filters: DailyArticleListFilter = Query(...)
):
    qs = _get_queryset(request.auth).order_by("date")
    qs = filters.filter(qs)
    return qs
