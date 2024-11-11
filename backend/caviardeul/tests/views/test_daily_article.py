import logging
from collections import defaultdict
from datetime import datetime
from typing import Literal

import pytest
from django.utils.timezone import make_aware
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
    archive: bool
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
            "category": 1,
            "nbWinners": article.nb_winners,
        }

    def test_error_with_article(self, client, caplog, mock_wiki_api_redirect):
        article = DailyArticleFactory(trait_current=True)
        mock_wiki_api_redirect(article.page_id, article.page_name)

        with caplog.at_level(logging.ERROR):
            res = client.get("/articles/current")
        assert "Redirection received in article payload" in caplog.text

        assert res.status_code == 500, res.content
        data = res.json()
        assert data["detail"]

    def test_no_article_available(self, client):
        _ = DailyArticleFactory(trait_future=True)

        res = client.get("/articles/current")
        assert res.status_code == 404, res.content
        data = res.json()
        assert data["detail"]


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
        *articles, _, _ = [
            *DailyArticleFactory.create_batch(4, trait_past=True),
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

        data = res.json()["items"]
        assert len(data) == len(articles)

        for item, expected_article in zip(data, articles, strict=True):
            DailyArticleListSchema.model_validate(item)
            assert item["articleId"] == expected_article.id

            expected_score = None
            if authenticated:
                expected_score = DailyArticleScore.objects.filter(
                    daily_article=expected_article, user=user
                ).first()

            assert item["archive"] is True
            if not expected_score:
                assert item["userScore"] is None
                assert item["pageName"] is None
            else:
                assert item["pageName"] == expected_article.page_name
                assert item["userScore"] == {
                    "nbAttempts": expected_score.nb_attempts,
                    "nbCorrect": expected_score.nb_correct,
                }

    @pytest.mark.parametrize("authenticated", [True, False])
    @pytest.mark.parametrize("status", ["finished", "not_finished", None])
    def test_filter_archived_articles(self, client, authenticated, status):
        articles = DailyArticleFactory.create_batch(5, trait_past=True)
        articles = sorted(articles, key=lambda a: a.date)

        user, other_user = UserFactory.create_batch(2)
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        DailyArticleScoreFactory(user=user, daily_article=articles[0])
        DailyArticleScoreFactory(user=user, daily_article=articles[2])
        DailyArticleScoreFactory(user=other_user, daily_article=articles[2])
        DailyArticleScoreFactory(user=other_user, daily_article=articles[3])

        params = {}
        if status is not None:
            params["status"] = status

        res = client.get("/articles", params)
        assert res.status_code == 200, res.content

        if status == "finished":
            expected_articles = [articles[0], articles[2]] if authenticated else []
        elif status == "not_finished":
            expected_articles = (
                [articles[1], articles[3], articles[4]] if authenticated else articles
            )
        else:
            expected_articles = articles

        data = res.json()["items"]
        assert all(
            item["articleId"] == article.id
            for item, article in zip(data, expected_articles, strict=True)
        )

    @pytest.mark.parametrize("authenticated", [True, False])
    @pytest.mark.parametrize("order", ["date", "difficulty", "score"])
    @pytest.mark.parametrize("asc", [True, False])
    def test_order_archived_articles(self, client, authenticated, order, asc):
        articles = [
            DailyArticleFactory(date=make_aware(datetime(2024, 1, 1)), median=10),
            DailyArticleFactory(date=make_aware(datetime(2024, 1, 2)), median=5),
            DailyArticleFactory(date=make_aware(datetime(2024, 1, 3)), median=15),
            DailyArticleFactory(date=make_aware(datetime(2024, 1, 4)), median=10),
            DailyArticleFactory(date=make_aware(datetime(2024, 1, 5)), median=5),
        ]

        user, other_user = UserFactory.create_batch(2)
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        DailyArticleScoreFactory(user=user, daily_article=articles[0], nb_attempts=50)
        DailyArticleScoreFactory(user=user, daily_article=articles[2], nb_attempts=30)
        DailyArticleScoreFactory(user=user, daily_article=articles[3], nb_attempts=50)
        DailyArticleScoreFactory(user=other_user, daily_article=articles[2])
        DailyArticleScoreFactory(user=other_user, daily_article=articles[2])
        DailyArticleScoreFactory(user=other_user, daily_article=articles[3])

        scores = defaultdict(int)
        for score in DailyArticleScore.objects.filter(user=user):
            scores[score.daily_article_id] = score.nb_attempts

        params = {"order": order, "asc": asc}
        res = client.get("/articles", params)
        assert res.status_code == 200, res.content

        if order == "date":
            articles = sorted(articles, key=lambda a: a.date, reverse=not asc)
        elif order == "difficulty":
            if asc:
                articles = sorted(articles, key=lambda a: (a.median, a.date))
            else:
                articles = sorted(articles, key=lambda a: (-a.median, a.date))
        elif order == "score":
            if not authenticated:
                articles = sorted(articles, key=lambda a: a.date)
            elif asc:
                articles = sorted(articles, key=lambda a: (scores[a.id], a.date))
            else:
                articles = sorted(articles, key=lambda a: (-scores[a.id], a.date))

        data = res.json()["items"]
        assert all(
            item["articleId"] == article.id
            for item, article in zip(data, articles, strict=True)
        )

    def test_pagination(self, client):
        articles = DailyArticleFactory.create_batch(10, trait_past=True)
        articles = sorted(articles, key=lambda a: a.date)

        params = {"limit": 3, "offset": 4, "order": "date", "asc": True}
        res = client.get("/articles", params)
        assert res.status_code == 200, res.content

        data = res.json()
        assert data["count"] == len(articles)
        assert tuple(item["articleId"] for item in data["items"]) == tuple(
            article.id for article in articles[4:7]
        )


class TestGetDailyArticleStats:
    @pytest.mark.parametrize("authenticated", [True, False])
    def test_get_daily_article_stats(self, client, authenticated):
        *articles, _ = [
            *DailyArticleFactory.create_batch(5, trait_past=True),
            DailyArticleFactory(trait_current=True),
            DailyArticleFactory(trait_future=True),
        ]

        user, other_user = UserFactory.create_batch(2)
        if authenticated:
            client.cookies.load({"userId": str(user.id)})

        DailyArticleScoreFactory(
            user=user, daily_article=articles[0], nb_attempts=59, nb_correct=26
        )
        DailyArticleScoreFactory(
            user=user, daily_article=articles[2], nb_attempts=33, nb_correct=21
        )
        DailyArticleScoreFactory(
            user=user, daily_article=articles[3], nb_attempts=42, nb_correct=12
        )
        DailyArticleScoreFactory(user=other_user, daily_article=articles[2])
        DailyArticleScoreFactory(user=other_user, daily_article=articles[2])

        res = client.get("/articles/stats")
        assert res.status_code == 200, res.content

        expected = {
            "total": len(articles),
            "totalFinished": 3 if authenticated else 0,
            "averageNbAttempts": 45 if authenticated else 0,
            "averageNbCorrect": 20 if authenticated else 0,
        }

        data = res.json()
        assert data == expected
