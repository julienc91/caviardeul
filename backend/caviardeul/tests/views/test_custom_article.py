import json
from typing import Literal

import pytest
from pydantic import BaseModel

from caviardeul.constants import Safety
from caviardeul.models import CustomArticle, User
from caviardeul.services.encryption import decrypt_data
from caviardeul.tests.factories import CustomArticleFactory, UserFactory

pytestmark = pytest.mark.django_db


class CustomArticleSchema(BaseModel):
    pageName: str
    key: str
    content: str
    articleId: str
    safety: Literal[*Safety.values]
    archive: Literal[False]
    custom: Literal[True]
    userScore: Literal[None]


def validate_serialization(data: dict, custom_article: CustomArticle) -> bool:
    CustomArticleSchema.model_validate(data)

    assert len(data["key"]) > 0
    assert decrypt_data(data["pageName"], data["key"]) == custom_article.page_name
    assert (
        decrypt_data(data["content"], data["key"])
        == f"<h1>{custom_article.page_name}</h1>article content"
    )
    assert data["articleId"] == custom_article.public_id
    assert data["safety"] == custom_article.safety
    return True


class TestGetCustomArticle:
    def test_get_custom_article(self, mock_wiki_api, client):
        article = CustomArticleFactory()

        mock_wiki_api(article.page_id, article.page_name, "article content")

        res = client.get(f"/articles/custom/{article.public_id}")
        assert res.status_code == 200, res.content

        data = res.json()
        assert validate_serialization(data, article)

    def test_get_unknown_article(self, client):
        article = CustomArticleFactory()

        res = client.get(f"/articles/custom/{article.public_id}0")
        assert res.status_code == 404, res.content

    @pytest.mark.xfail()
    def test_get_invalid_custom_article(self, mock_wiki_api_error, client):
        article = CustomArticleFactory()
        mock_wiki_api_error(article.page_id)

        res = client.get(f"/articles/custom/{article.public_id}")
        assert res.status_code == 400, res.content


class TestCreateCustomArticle:
    @pytest.mark.parametrize("authenticated", [True, False])
    def test_create_custom_article(self, mock_wiki_api, client, authenticated):
        mock_wiki_api("my_article", "My article", "article content")

        user = UserFactory()
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        res = client.post(
            "/articles/custom",
            json.dumps({"pageId": "my_article"}),
            content_type="application/json",
        )
        assert res.status_code == 201, res.content

        article = CustomArticle.objects.get()
        if authenticated:
            assert article.created_by_id == user.id
        else:
            new_user = User.objects.exclude(id=user.id).get()
            assert str(new_user.id) == client.cookies["userId"].value
            assert article.created_by_id == new_user.id

        assert article.page_id == "my_article"
        assert article.page_name == "My article"

        data = res.json()
        validate_serialization(data, article)

    def test_create_invalid_article(self, mock_wiki_api_error, client):
        mock_wiki_api_error("my_article")

        res = client.post(
            "/articles/custom",
            json.dumps({"pageId": "my_article"}),
            content_type="application/json",
        )
        assert res.status_code == 400, res.content

    @pytest.mark.parametrize("same_user", [True, False])
    def test_create_existing_custom_article(self, mock_wiki_api, client, same_user):
        user, other_user = UserFactory.create_batch(2)
        client.cookies.load({"userId": str(user.id)})
        custom_article = CustomArticleFactory(
            created_by=user if same_user else other_user
        )

        mock_wiki_api(
            custom_article.page_id, custom_article.page_name, "article content"
        )

        res = client.post(
            "/articles/custom",
            json.dumps({"pageId": custom_article.page_id}),
            content_type="application/json",
        )
        assert res.status_code == 201, res.content

        data = res.json()
        if same_user:
            assert data["articleId"] == custom_article.public_id
        else:
            assert data["articleId"] != custom_article.public_id
            assert (
                data["articleId"]
                == CustomArticle.objects.get(created_by=user).public_id
            )
