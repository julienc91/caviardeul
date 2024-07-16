from django.contrib.auth.models import AnonymousUser
from django.db.models import FilteredRelation, Q
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
    qs = _get_queryset(request.auth)
    qs = filters.filter(qs)
    qs = ordering.apply(qs)
    return qs
