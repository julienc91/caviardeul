from datetime import timedelta

from django.contrib.auth.models import AnonymousUser
from django.db.models import Avg, Count, FilteredRelation, Q, QuerySet
from django.http import HttpRequest
from django.utils import timezone
from ninja import Query
from ninja.pagination import paginate

from caviardeul.exceptions import ArticleFetchError
from caviardeul.models import DailyArticle, User
from caviardeul.serializers.daily_article import (
    DailyArticleListFilter,
    DailyArticleListOrdering,
    DailyArticleListSchema,
    DailyArticleSchema,
    DailyArticlesStatsSchema,
)
from caviardeul.serializers.error import ErrorSchema
from caviardeul.services.articles import get_article_content
from caviardeul.services.authentication import OptionalAPIAuthentication
from caviardeul.services.daily_article import get_current_daily_article_id
from caviardeul.services.logging import logger

from .api import api


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
    "/articles/current",
    auth=OptionalAPIAuthentication(),
    response={200: DailyArticleSchema, 404: ErrorSchema, 500: ErrorSchema},
)
def get_current_article(request: HttpRequest):
    article_id = get_current_daily_article_id()
    return _get_daily_article_response(
        _get_queryset(request.auth).filter(id=article_id)
    )


@api.get(
    "/articles/{article_id}",
    auth=OptionalAPIAuthentication(),
    response={200: DailyArticleSchema, 404: ErrorSchema, 500: ErrorSchema},
)
def get_archived_article(request: HttpRequest, article_id: int):
    return _get_daily_article_response(
        _get_queryset(request.auth).filter(id=article_id)
    )


def _get_daily_article_response(queryset: QuerySet[DailyArticle]):
    try:
        article = queryset.get()
    except DailyArticle.DoesNotExist:
        return 404, {"detail": "L'article n'a pas été trouvé"}

    try:
        article.content = get_article_content(article)
    except ArticleFetchError:
        logger.exception(
            "Error encountered with daily article", extra={"article_id": article.id}
        )
        return 500, {"detail": "Un problème a été rencontré avec cet article"}
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
