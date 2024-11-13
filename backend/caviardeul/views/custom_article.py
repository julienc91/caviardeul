from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from ninja.errors import HttpError

from caviardeul.constants import Safety
from caviardeul.exceptions import ArticleFetchError
from caviardeul.models import CustomArticle
from caviardeul.serializers.custom_article import (
    CustomArticleCreateSchema,
    CustomArticleSchema,
)
from caviardeul.services.articles import (
    get_article_content,
    get_article_html_from_wikipedia,
)
from caviardeul.services.authentication import optional_api_authentication
from caviardeul.services.custom_article import generate_public_id
from caviardeul.services.user import create_user_for_request

from .api import api


@api.get("/articles/custom/{public_id}", response=CustomArticleSchema)
def get_custom_article(request: HttpRequest, public_id: str) -> CustomArticle:
    article = get_object_or_404(CustomArticle, public_id=public_id)

    try:
        content = get_article_content(article)
    except ArticleFetchError:
        raise HttpError(400, "L'article n'a pas été trouvé")

    article.content = content
    return article


@api.post(
    "/articles/custom",
    auth=optional_api_authentication,
    response={201: CustomArticleSchema},
)
def create_custom_article(
    request: HttpRequest, payload: CustomArticleCreateSchema, response: HttpResponse
) -> CustomArticle:
    try:
        page_title, _ = get_article_html_from_wikipedia(payload.page_id)
    except ArticleFetchError:
        raise HttpError(400, "L'article n'a pas été trouvé")

    if not request.auth.is_authenticated:
        create_user_for_request(request, response)

    public_id = generate_public_id()
    article, _ = CustomArticle.objects.get_or_create(
        page_id=payload.page_id,
        created_by=request.auth,
        defaults=dict(
            public_id=public_id,
            page_name=page_title,
            nb_winners=0,
            median=0,
            stats={},
            safety=Safety.UNKNOWN,
        ),
    )

    article.content = get_article_content(article)
    return article
