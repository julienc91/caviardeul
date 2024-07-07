from typing import Literal

import pytest
from pydantic import BaseModel

from caviardeul.constants import Safety
from caviardeul.models import DailyArticle, DailyArticleScore
from caviardeul.services.encryption import decrypt_data
from caviardeul.tests.factories import (
    DailyArticleFactory,
    DailyArticleScoreFactory,
    UserFactory,
)

pytestmark = pytest.mark.django_db


class UserScoreSchema(BaseModel):
    nbAttempts: int
    nbCorrect: int


class ArticleStatsSchema(BaseModel):
    median: int
    nbWinners: int
    category: int


class DailyArticleDetailSchema(BaseModel):
    articleId: int
    archive: bool
    custom: Literal[False]
    safety: Literal[Safety.SAFE]
    key: str
    pageName: str
    content: str
    userScore: UserScoreSchema | None
    stats: ArticleStatsSchema


class DailyArticleListSchema(BaseModel):
    articleId: int
    archive: Literal[True]
    pageName: str | None
    userScore: UserScoreSchema | None
    stats: ArticleStatsSchema


def validate_serialization(data: dict, daily_article: DailyArticle) -> bool:
    DailyArticleDetailSchema.model_validate(data)

    assert len(data["key"]) > 0
    assert decrypt_data(data["pageName"], data["key"]) == daily_article.page_name
    assert (
        decrypt_data(data["content"], data["key"])
        == f"<h1>{daily_article.page_name}</h1>article content"
    )
    assert data["articleId"] == daily_article.id
    assert data["safety"] == "safe"
    return True


class TestGetCurrentArticle:
    @pytest.mark.parametrize(
        "authenticated, with_score", [(False, False), (True, False), (True, True)]
    )
    def test_get_current_article(
        self, mock_wiki_api, client, authenticated, with_score
    ):
        stats = {"0": 3, "2": 3, "4": 3, "6": 1}
        _, article, _ = (
            DailyArticleFactory(trait_past=True),
            DailyArticleFactory(
                trait_current=True, nb_winners=10, stats={"distribution": stats}
            ),
            DailyArticleFactory(trait_future=True),
        )

        mock_wiki_api(article.page_id, article.page_name, "article content")

        user = UserFactory()
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        score = None
        if with_score or not authenticated:
            score = DailyArticleScoreFactory(user=user, daily_article=article)

        res = client.get("/articles/current")
        assert res.status_code == 200, res.content

        data = res.json()
        validate_serialization(data, article)
        assert data["archive"] is False

        if authenticated and with_score:
            assert data["userScore"] == {
                "nbAttempts": score.nb_attempts,
                "nbCorrect": score.nb_correct,
            }
        else:
            assert data["userScore"] is None

        assert data["stats"] == {
            "median": 20,
            "category": 0,
            "nbWinners": article.nb_winners,
        }

    def test_no_article_available(self, client):
        _ = DailyArticleFactory(trait_future=True)

        res = client.get("/articles/current")
        assert res.status_code == 404, res.content


class TestGetAchivedArticle:
    @pytest.mark.parametrize(
        "authenticated, with_score", [(False, False), (True, False), (True, True)]
    )
    def test_get_archived_article(
        self, mock_wiki_api, client, authenticated, with_score
    ):
        _, article, _ = (
            DailyArticleFactory(trait_past=True),
            DailyArticleFactory(trait_past=True),
            DailyArticleFactory(trait_future=True),
        )

        mock_wiki_api(article.page_id, article.page_name, "article content")

        user = UserFactory()
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        score = None
        if with_score or not authenticated:
            score = DailyArticleScoreFactory(user=user, daily_article=article)

        res = client.get(f"/articles/{article.id}")
        assert res.status_code == 200, res.content

        data = res.json()
        validate_serialization(data, article)
        assert data["archive"] is True

        if authenticated and with_score:
            assert data["userScore"] == {
                "nbAttempts": score.nb_attempts,
                "nbCorrect": score.nb_correct,
            }
        else:
            assert data["userScore"] is None

    def test_get_future_article(self, client):
        article = DailyArticleFactory(trait_future=True)
        res = client.get(f"/articles/{article.id}")
        assert res.status_code == 404, res.content


class TestListArchivedArticles:
    @pytest.mark.parametrize("authenticated", [True, False])
    def test_list_archived_articles(self, client, authenticated):
        *articles, _ = [
            *DailyArticleFactory.create_batch(3, trait_past=True),
            DailyArticleFactory(trait_current=True),
            DailyArticleFactory(trait_future=True),
        ]
        articles = sorted(articles, key=lambda a: a.date)

        user, other_user = UserFactory.create_batch(2)
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        DailyArticleScoreFactory(user=user, daily_article=articles[0])
        DailyArticleScoreFactory(user=user, daily_article=articles[2])
        DailyArticleScoreFactory(user=other_user, daily_article=articles[2])
        DailyArticleScoreFactory(user=other_user, daily_article=articles[3])

        res = client.get("/articles")
        assert res.status_code == 200, res.content

        data = res.json()
        assert len(data) == len(articles)

        for item, expected_aticle in zip(data, articles, strict=True):
            DailyArticleListSchema.model_validate(item)
            assert item["articleId"] == expected_aticle.id

            expected_score = None
            if authenticated:
                expected_score = DailyArticleScore.objects.filter(
                    daily_article=expected_aticle, user=user
                ).first()

            if not expected_score:
                assert item["userScore"] is None
                assert item["pageName"] is None
            else:
                assert item["pageName"] == expected_aticle.page_name
                assert item["userScore"] == {
                    "nbAttempts": expected_score.nb_attempts,
                    "nbCorrect": expected_score.nb_correct,
                }
