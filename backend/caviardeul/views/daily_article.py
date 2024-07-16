from datetime import timedelta

from django.contrib.auth.models import AnonymousUser
from django.db.models import Avg, Count, FilteredRelation, Q
from django.http import Http404, HttpRequest
from django.utils import timezone
from ninja import Query
from ninja.pagination import paginate

from caviardeul.models import DailyArticle, User
from caviardeul.serializers.daily_article import (
    DailyArticleListFilter,
    DailyArticleListOrdering,
    DailyArticleListSchema,
    DailyArticleSchema,
    DailyArticlesStatsSchema,
)
from caviardeul.services.articles import get_article_content
from caviardeul.services.authentication import OptionalAPIAuthentication

from .api import api


def _get_queryset(user: User | AnonymousUser):
    queryset = DailyArticle.objects.filter(date__lte=timezone.now())
    if not user.is_authenticated:
        user = None

    return queryset.annotate(
        user_score=FilteredRelation(
            "dailyarticlescore",
            condition=Q(dailyarticlescore__user=user),
        )
    ).select_related("user_score")


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
    "/articles/stats",
    auth=OptionalAPIAuthentication(),
    response=DailyArticlesStatsSchema,
)
def get_daily_article_stats(request: HttpRequest):
    return _get_queryset(request.auth).aggregate(
        total=Count("id"),
        total_finished=Count("id", filter=Q(user_score__isnull=False)),
        average_nb_attempts=Avg("user_score__nb_attempts"),
        average_nb_correct=Avg("user_score__nb_correct"),
    )


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
@paginate
def list_archived_articles(
    request: HttpRequest,
    filters: DailyArticleListFilter = Query(...),
    ordering: DailyArticleListOrdering = Query(...),
):
    now = timezone.now()
    qs = _get_queryset(request.auth).filter(date__lt=now - timedelta(days=1))
    qs = filters.filter(qs)
    qs = ordering.apply(qs)
    return qs
